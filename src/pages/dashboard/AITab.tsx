'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare, Upload, Loader2, Bot, User } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversation_id: string;
  image_url?: string;
}

interface Conversation {
  id: string;
  title: string | null;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────────
// GEMINI CONFIG
// ──────────────────────────────────────────────────────────────
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent`;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Set in .env.local

if (!GEMINI_API_KEY) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is missing in .env.local');
}

export const AITab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────────────────────────
  // 1. Load User & Conversations
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (profile) {
        setUserId(profile.id);
        loadConversations(profile.id);
      }
    };

    loadUser();
  }, []);

  const loadConversations = async (profileId: string) => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, title, updated_at')
      .eq('user_id', profileId)
      .order('updated_at', { ascending: false });

    setConversations(data ?? []);
    if (data?.length && !activeConv) {
      setActiveConv(data[0].id);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // 2. Load Messages + Realtime
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConv || !userId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at, conversation_id, image_url')
        .eq('conversation_id', activeConv)
        .order('created_at', { ascending: true });

      setMessages(data ?? []);
      setLoading(false);
    };

    loadMessages();

    const channel = supabase
      .channel(`messages-${activeConv}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ──────────────────────────────────────────────────────────────
  // 3. Create New Conversation
  // ──────────────────────────────────────────────────────────────
  const createConversation = async (): Promise<string> => {
    if (!userId) throw new Error('User not found');

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        title: 'New Chat',
      })
      .select()
      .single();

    if (error) throw error;

    setConversations((prev) => [data, ...prev]);
    setActiveConv(data.id);
    return data.id;
  };

  // ──────────────────────────────────────────────────────────────
  // 4. File Upload → Base64 (for Gemini Vision)
  // ──────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!activeConv || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      const mimeType = file.type;

      const userMsg = {
        conversation_id: activeConv,
        role: 'user' as const,
        content: `Uploaded: ${file.name}`,
        image_url: `data:${mimeType};base64,${base64.split(',')[1]}`,
      };

      await supabase.from('ai_messages').insert(userMsg);
    };

    reader.readAsDataURL(file);
  }, [activeConv]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false,
  });

  // ──────────────────────────────────────────────────────────────
  // 5. Send Message + Call Gemini API (Streaming)
  // ──────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || !activeConv || streaming || !GEMINI_API_KEY) return;

    const userMessage = input.trim();
    setInput('');
    setStreaming(true);

    // Insert user message
    const { data: userMsg } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: activeConv,
        role: 'user',
        content: userMessage,
      })
      .select()
      .single();

    // Prepare Gemini request body
    const geminiMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => {
        if (m.image_url && m.image_url.startsWith('data:')) {
          const [mime, data] = m.image_url.split(';base64,');
          return {
            role: m.role,
            parts: [
              { text: m.content },
              {
                inline_data: {
                  mime_type: mime.replace('data:', ''),
                  data: data,
                },
              },
            ],
          };
        }
        return { role: m.role, parts: [{ text: m.content }] };
      });

    geminiMessages.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Insert assistant placeholder
    const { data: assistantMsg } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: activeConv,
        role: 'assistant',
        content: '',
      })
      .select()
      .single();

    let assistantContent = '';

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              assistantContent += text;
              await supabase
                .from('ai_messages')
                .update({ content: assistantContent })
                .eq('id', assistantMsg.id);
            }
          } catch {}
        }
      }

      // Auto-title
      if (messages.length === 1) {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', activeConv);
        setConversations(prev =>
          prev.map(c => (c.id === activeConv ? { ...c, title } : c))
        );
      }
    } catch (error: any) {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConv,
          role: 'assistant',
          content: `Error: ${error.message}`,
        });
    } finally {
      setStreaming(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // UI (Same as before)
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AI Assistant</CardTitle>
            <Button size="sm" onClick={() => createConversation().then(() => setMessages([]))}>
              New Chat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <Button
                key={c.id}
                variant={activeConv === c.id ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => setActiveConv(c.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="truncate">{c.title || 'Untitled'}</span>
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="md:col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Farm AI Assistant (Gemini)
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-20">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Start a conversation by typing below.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex gap-2 max-w-md">
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {m.image_url && m.image_url.startsWith('data:') && (
                      <img
                        src={m.image_url}
                        alt="Attachment"
                        className="max-w-xs rounded mb-2"
                      />
                    )}
                    {m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {streaming && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 space-y-3">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">
              {isDragActive ? 'Drop file here' : 'Drop image or PDF here'}
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about crops, pests, weather..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={!activeConv || streaming}
            />
            <Button
              onClick={sendMessage}
              disabled={!activeConv || !input.trim() || streaming}
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};