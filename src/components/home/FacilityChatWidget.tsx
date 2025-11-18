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
import LeadGate from '@/components/shared/LeadGate';
import { dispatchLead } from '@/services/leadDispatch';

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
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [extractedParams, setExtractedParams] = useState<any>(null);
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
        onDone: () => {
          setIsStreaming(false);
          
          // Check if this is the trigger message for report generation
          if (assistantContent.includes("Perfect! I have everything I need. Let me generate your personalized facility report")) {
            handleTriggerLeadCapture();
          }
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

  const handleTriggerLeadCapture = () => {
    // Extract parameters from conversation for later use
    const params = extractParametersFromConversation();
    setExtractedParams(params);
    setShowLeadGate(true);
  };

  const extractParametersFromConversation = () => {
    const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
    
    // Extract sports mentioned in conversation
    const sportsKeywords: Record<string, string[]> = {
      basketball: ['basketball', 'hoops'],
      volleyball: ['volleyball', 'volley'],
      pickleball: ['pickleball', 'pickle'],
      turf: ['turf', 'soccer', 'football', 'field'],
      tennis: ['tennis'],
      'multi-sport': ['multi-sport', 'multiple sports', 'various sports'],
    };
    
    const detectedSports: string[] = [];
    Object.entries(sportsKeywords).forEach(([sport, keywords]) => {
      if (keywords.some(kw => conversationText.includes(kw))) {
        detectedSports.push(sport);
      }
    });
    
    const sports = detectedSports.length > 0 ? detectedSports.join(', ') : 'Basketball';
    
    // Extract size
    const sizeMatch = conversationText.match(/(\d+,?\d*)\s*(square feet|sq\.? ?ft?\.?|sf)/i);
    let squareFootage = sizeMatch ? parseInt(sizeMatch[1].replace(',', '')) : 30000;
    let facilitySize = 'Medium (25k-50k sf)';
    
    if (conversationText.includes('small')) {
      squareFootage = 15000;
      facilitySize = 'Small (10k-25k sf)';
    } else if (conversationText.includes('medium')) {
      squareFootage = 35000;
      facilitySize = 'Medium (25k-50k sf)';
    } else if (conversationText.includes('large') || conversationText.includes('big')) {
      squareFootage = 60000;
      facilitySize = 'Large (50k+ sf)';
    }
    
    // Extract location
    const stateMatch = conversationText.match(/\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/i);
    const cityMatch = conversationText.match(/\bin\s+([a-z\s]+),?\s+(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b/i);
    
    const city = cityMatch ? cityMatch[1].trim() : '';
    const state = stateMatch ? stateMatch[0] : '';
    
    // Generate simple estimates based on square footage
    const costPerSqFt = 200; // Average cost per sq ft for sports facilities
    const equipmentCost = squareFootage * 50;
    const totalCost = squareFootage * costPerSqFt + equipmentCost;
    const monthlyRevenue = squareFootage * 3; // $3 per sq ft monthly revenue estimate
    
    return {
      sports,
      facilitySize,
      squareFootage,
      city,
      state,
      estimatedBudget: totalCost,
      estimatedMonthlyRevenue: monthlyRevenue,
      equipmentCost,
    };
  };

  const handleLeadSubmit = async (leadData: any) => {
    try {
      setIsGeneratingReport(true);
      
      // Dispatch lead to backend (Google Sheets sync + emails)
      await dispatchLead({
        ...leadData,
        sports: extractedParams?.sports || 'Not specified',
        facilitySize: extractedParams?.facilitySize || 'Not specified',
        estimatedBudget: extractedParams?.estimatedBudget || 0,
        estimatedMonthlyRevenue: extractedParams?.estimatedMonthlyRevenue || 0,
        estimatedSquareFootage: extractedParams?.squareFootage || 0,
        city: extractedParams?.city || leadData.city,
        state: extractedParams?.state || leadData.state,
        source: 'ai-chat',
        sourceDetail: 'facility-chat-widget',
      });
      
      toast({
        title: 'Success!',
        description: 'Your facility report has been sent to your email.',
      });
      
      // Close widget and clear chat
      clearChatHistory();
      setShowLeadGate(false);
      onClose();
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: 'Error',
        description: 'There was an issue generating your report. Please try again.',
        variant: 'destructive',
      });
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateReportFromConversation = () => {
    setIsGeneratingReport(true);
    
    // Simple heuristic: extract sports from conversation
    const conversationText = messages.map(m => m.content.toLowerCase()).join(' ');
    
    // Extract sports mentioned
    const sports: string[] = [];
    const sportKeywords = ['basketball', 'soccer', 'volleyball', 'pickleball', 'tennis', 'baseball', 'hockey', 'lacrosse'];
    sportKeywords.forEach(sport => {
      if (conversationText.includes(sport)) {
        sports.push(sport);
      }
    });

    // Default parameters if not enough info
    const params = {
      sports: sports.length > 0 ? sports : ['basketball'],
      facilitySize: 'medium' as const,
      location: 'average' as const,
    };

    // Navigate to results page
    const searchParams = new URLSearchParams();
    searchParams.set('sports', params.sports.join(','));
    searchParams.set('size', params.facilitySize);
    searchParams.set('location', params.location);
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
    <>
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

    {/* Lead Gate Modal */}
    <LeadGate
      isOpen={showLeadGate}
      onClose={() => setShowLeadGate(false)}
      onSubmit={handleLeadSubmit}
      mode="modal"
      title="Get Your Personalized Facility Report"
      description="Enter your contact information to receive your detailed facility plan and cost estimates."
      submitButtonText={isGeneratingReport ? "Generating Report..." : "Generate Report"}
    />
    </>
  );
};
