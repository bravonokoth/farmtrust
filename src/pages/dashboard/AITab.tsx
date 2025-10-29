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
}

interface Conversation {
  id: string;
  title: string | null;
  updated_at: string;
}

// Gemini Config
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('VITE_GEMINI_API_KEY is missing in .env');
}

export const AITab = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profile & conversations
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
        setProfileId(profile.id);
        loadConversations(profile.id);
      }
    };
    loadUser();
  }, []);

  const loadConversations = async (userId: string) => {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id, title, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    setConversations(data ?? []);
    if (data?.length && !activeConv) setActiveConv(data[0].id);
  };

  // Load messages + Realtime
  useEffect(() => {
    if (!activeConv || !profileId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at, conversation_id')
        .eq('conversation_id', activeConv)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
        return;
      }

      // Type-safe transformation
      const typed: Message[] = (data ?? []).map((m) => ({
        id: m.id,
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content || '',
        created_at: m.created_at,
        conversation_id: m.conversation_id,
      }));
      
      setMessages(typed);
      setLoading(false);
    };

    loadMessages();

    const channel = supabase
      .channel(`msg-${activeConv}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${activeConv}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, any>;
          const typedMsg: Message = {
            id: newMsg.id,
            role: (newMsg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: newMsg.content || '',
            created_at: newMsg.created_at,
            conversation_id: newMsg.conversation_id,
          };

          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, typedMsg]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === typedMsg.id ? typedMsg : m))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv, profileId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // New conversation
  const createConversation = async (): Promise<string> => {
    if (!profileId) throw new Error('No profile');

    const { data } = await supabase
      .from('ai_conversations')
      .insert({ user_id: profileId, title: 'New Chat' })
      .select()
      .single();

    if (!data) throw new Error('Failed to create conv');

    setConversations((p) => [data, ...p]);
    setActiveConv(data.id);
    setMessages([]);
    return data.id;
  };

  // File upload (store as base64 in content with marker)
  const onDrop = useCallback(
    async (files: File[]) => {
      if (!activeConv || !files[0]) return;
      const file = files[0];
      const base64 = await fileToBase64(file);
      
      // Store image in content with special marker
      await supabase.from('ai_messages').insert({
        conversation_id: activeConv,
        role: 'user',
        content: `[IMAGE:${file.name}]${base64}`,
      });
    },
    [activeConv]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false,
  });

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Send message with Gemini streaming
  const sendMessage = async () => {
    if (!input.trim() || !activeConv || streaming || !GEMINI_API_KEY) return;

    const userText = input.trim();
    setInput('');
    setStreaming(true);

    try {
      // Insert user message
      const { data: userMsg, error: userError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConv,
          role: 'user',
          content: userText,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Build Gemini payload
      const contents = messages.map((m) => {
        const parts: any[] = [];
        
        // Check if message contains image
        if (m.content.startsWith('[IMAGE:')) {
          const imageMatch = m.content.match(/\[IMAGE:([^\]]+)\](data:[^;]+;base64,[^\s]+)/);
          if (imageMatch) {
            const [, filename, dataUrl] = imageMatch;
            const [mimeType, base64Data] = dataUrl.split(';base64,');
            const mime = mimeType.replace('data:', '');
            
            parts.push({ text: `Image: ${filename}` });
            parts.push({
              inline_data: {
                mime_type: mime,
                data: base64Data,
              },
            });
          }
        } else {
          parts.push({ text: m.content });
        }
        
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts,
        };
      });

      contents.push({ 
        role: 'user', 
        parts: [{ text: userText }] 
      });

      // Create assistant placeholder
      const { data: assistantMsg, error: assistantError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConv,
          role: 'assistant',
          content: '',
        })
        .select()
        .single();

      if (assistantError || !assistantMsg) throw assistantError;

      let accumulated = '';

      // Stream from Gemini
      const resp = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 2048 
          },
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Gemini ${resp.status}: ${txt}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const delta = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (delta) {
              accumulated += delta;
              await supabase
                .from('ai_messages')
                .update({ content: accumulated })
                .eq('id', assistantMsg.id);
            }
          } catch (e) {
            // Skip JSON parse errors
          }
        }
      }

      // Auto-title first message
      if (messages.length === 0) {
        const title = userText.slice(0, 50) + (userText.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', activeConv);
        setConversations((p) =>
          p.map((c) => (c.id === activeConv ? { ...c, title } : c))
        );
      }
    } catch (e: any) {
      console.error('Send message error:', e);
      await supabase.from('ai_messages').insert({
        conversation_id: activeConv,
        role: 'assistant',
        content: `Error: ${e.message || 'Failed to send message'}`,
      });
    } finally {
      setStreaming(false);
    }
  };

  // Helper to render message content
  const renderMessageContent = (message: Message) => {
    // Check if message contains an image
    if (message.content.startsWith('[IMAGE:')) {
      const imageMatch = message.content.match(/\[IMAGE:([^\]]+)\](data:[^;]+;base64,[^\s]+)/);
      if (imageMatch) {
        const [, filename, dataUrl] = imageMatch;
        return (
          <div>
            <img src={dataUrl} alt={filename} className="max-w-xs rounded mb-2" />
            <p className="text-xs text-muted-foreground">{filename}</p>
          </div>
        );
      }
    }
    
    // Regular text message
    if (message.role === 'assistant') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    
    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AI Assistant</CardTitle>
            <Button size="sm" onClick={() => createConversation()} disabled={!profileId}>
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

      {/* Chat */}
      <Card className="md:col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Farm AI Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
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
                <div className="flex gap-2 max-w-2xl">
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
                    {renderMessageContent(m)}
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

        {/* Input */}
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
            <Button onClick={sendMessage} disabled={!activeConv || !input.trim() || streaming}>
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};