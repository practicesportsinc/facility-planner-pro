import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send, Sparkles, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  ChatMessage,
  streamChat,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  FacilityParameters,
} from '@/utils/chatHelpers';

interface FacilityChatWidgetProps {
  onClose: () => void;
}

export const FacilityChatWidget = ({ onClose }: FacilityChatWidgetProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = loadChatHistory();
    if (history.length > 0) return history;
    return [
      {
        role: 'assistant',
        content: "Hi! I'm here to help you plan your sports facility. Tell me about your vision - what sports are you interested in?",
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save chat history on changes
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isGeneratingReport) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';
    const updateAssistant = (delta: string) => {
      assistantContent += delta;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent, timestamp: new Date() }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistant,
        onToolCall: (toolCall, params) => {
          console.log('[FacilityChatWidget] Tool call received:', toolCall.function.name, params);
          handleGenerateReport(params);
        },
        onDone: () => {
          setIsStreaming(false);
        },
        onError: (error) => {
          console.error('[FacilityChatWidget] Stream error:', error);
          setIsStreaming(false);
          toast({
            title: 'Connection Error',
            description: error.message.includes('Rate limit')
              ? 'You\'ve reached the message limit. Please try again later.'
              : 'Unable to connect. Please try again.',
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      setIsStreaming(false);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReport = (params: FacilityParameters) => {
    setIsGeneratingReport(true);
    
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '✨ Perfect! I have everything I need. Generating your personalized facility report...',
        timestamp: new Date(),
      },
    ]);

    // Navigate to results page with parameters
    const searchParams = new URLSearchParams();
    searchParams.set('sports', params.sports.join(','));
    searchParams.set('size', params.facilitySize);
    searchParams.set('location', params.location);
    if (params.buildMode) searchParams.set('buildMode', params.buildMode);
    if (params.budget) searchParams.set('budget', params.budget.toString());
    searchParams.set('source', 'ai-chat');

    setTimeout(() => {
      navigate(`/quick-estimate?${searchParams.toString()}`);
      clearChatHistory();
    }, 1500);
  };

  const handleRestart = () => {
    clearChatHistory();
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm here to help you plan your sports facility. Tell me about your vision - what sports are you interested in?",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: 'Chat Reset',
      description: 'Starting a fresh conversation.',
    });
  };

  return (
    <Card className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-[450px] md:h-[600px] flex flex-col shadow-2xl border-primary/20 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Facility Planner</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            disabled={isStreaming || isGeneratingReport}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            </div>
          </div>
        )}

        {isGeneratingReport && (
          <div className="flex justify-start">
            <div className="bg-accent text-accent-foreground rounded-lg px-4 py-2">
              <p className="text-sm">✨ Generating your personalized report...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your facility vision..."
            disabled={isStreaming || isGeneratingReport}
            maxLength={500}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming || isGeneratingReport}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
