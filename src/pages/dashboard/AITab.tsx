// src/pages/dashboard/AITab.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversation_id: string;
}

export const AITab = () => {
  const [conversations, setConversations] = useState<Array<{ id: string; title: string | null }>>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------
  // 1. Load user’s conversations
  // -----------------------------------------------------------------
  useEffect(() => {
    const loadConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('ai_conversations')
        .select('id, title')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false });

      setConversations(data ?? []);
      if (data?.length) setActiveConv(data[0].id);
    };

    loadConversations();
  }, []);

  // -----------------------------------------------------------------
  // 2. Load messages for the active conversation
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!activeConv) {
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
        console.error('loadMessages error:', error);
        setMessages([]);
      } else {
        // ---- TYPE‑SAFE CAST ----
        const safeMessages: Message[] = (data ?? []).map((m: any) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'assistant' : 'user', // force literal
          content: m.content,
          created_at: m.created_at,
          conversation_id: m.conversation_id,
        }));
        setMessages(safeMessages);
      }
      setLoading(false);
    };

    loadMessages();
  }, [activeConv]);

  // -----------------------------------------------------------------
  // 3. Send a user message
  // -----------------------------------------------------------------
  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;

    const userMsg = {
      conversation_id: activeConv,
      role: 'user' as const,
      content: input.trim(),
    };

    const { data: inserted, error } = await supabase
      .from('ai_messages')
      .insert(userMsg)
      .select()
      .single();

    if (error) {
      console.error('insert error:', error);
      return;
    }

    // Optimistically add to UI
    setMessages((prev) => [...prev, inserted as Message]);
    setInput('');

    // TODO: Call your AI backend when ready
    // await fetch('/api/ai', { method: 'POST', body: JSON.stringify({ msg: input }) });
  };

  // -----------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
      {/* Conversation list */}
      <Card className="md:col-span-1 overflow-y-auto">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {conversations.length === 0 ? (
            <p className="text-muted-foreground text-sm">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <Button
                key={c.id}
                variant={activeConv === c.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveConv(c.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {c.title || 'Untitled'}
              </Button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat area */}
      <Card className="md:col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle>AI Farm Assistant</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-20">
          {loading ? (
            <p className="text-muted-foreground">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground">Start a conversation by typing below.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
        </CardContent>

        <div className="border-t p-4 flex gap-2">
          <Input
            placeholder="Ask anything about your farm..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={!activeConv}
          />
          <Button onClick={sendMessage} disabled={!activeConv || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};