import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, Send, Sparkles, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChatMessage,
  QuickReplyButton,
  streamChat,
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
  FacilityParameters,
} from '@/utils/chatHelpers';
import LeadGate from '@/components/shared/LeadGate';
import { dispatchLead } from '@/services/leadDispatch';
import { supabase } from '@/integrations/supabase/client';

interface FacilityChatWidgetProps {
  onClose: () => void;
  initialMessage?: string;
}

export const FacilityChatWidget = ({ onClose, initialMessage }: FacilityChatWidgetProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = loadChatHistory();
    if (history.length > 0) return history;
    return [
      {
        role: 'assistant',
        content: "Welcome! I'm here to help you plan your sports facility. Let's get started by choosing your planning mode:",
        timestamp: new Date(),
        quickReplies: [
          {
            id: 'fast',
            label: '⚡ Fast / Basic',
            value: 'I want the Fast / Basic mode - give me a quick estimate',
            icon: '⚡'
          },
          {
            id: 'advanced',
            label: '🎯 Advanced',
            value: 'I want the Advanced mode - guide me through more details',
            icon: '🎯'
          },
          {
            id: 'expert',
            label: '🔬 Expert / Detailed',
            value: 'I want the Expert / Detailed mode - full comprehensive analysis',
            icon: '🔬'
          }
        ]
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [extractedParams, setExtractedParams] = useState<any>(null);
  const [selectedMode, setSelectedMode] = useState<'fast' | 'advanced' | 'expert' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);
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

  // Handle initial message - send only once when provided
  useEffect(() => {
    if (initialMessage && !initialMessageSent.current) {
      initialMessageSent.current = true;
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  // Detect mode from messages
  useEffect(() => {
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    if (/fast.*basic/i.test(lastUserMsg) && !selectedMode) {
      setSelectedMode('fast');
    } else if (/advanced.*mode/i.test(lastUserMsg) && !selectedMode) {
      setSelectedMode('advanced');
    } else if (/expert.*detailed/i.test(lastUserMsg) && !selectedMode) {
      setSelectedMode('expert');
    }
  }, [messages, selectedMode]);

  // Parse quick-reply buttons from assistant messages
  const parseQuickReplies = (content: string): { content: string; quickReplies?: QuickReplyButton[] } => {
    const delimiter = '[QUICK_REPLIES]';
    if (!content.includes(delimiter)) {
      return { content };
    }

    const parts = content.split(delimiter);
    const mainContent = parts[0].trim();
    const repliesJson = parts[1]?.trim();

    if (!repliesJson) {
      return { content: mainContent };
    }

    try {
      const quickReplies = JSON.parse(repliesJson);
      return { content: mainContent, quickReplies };
    } catch (e) {
      console.error('[FacilityChatWidget] Failed to parse quick replies:', e);
      return { content: mainContent };
    }
  };

  const handleSend = async (messageToSend?: string, clearButtons = false) => {
    const messageContent = messageToSend || input.trim();
    if (!messageContent || isStreaming || isGeneratingReport) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    // If this is a quick-reply button click, clear buttons from the last assistant message
    if (clearButtons) {
      setMessages((prev) => {
        const lastAssistantIndex = prev.length - 1;
        if (prev[lastAssistantIndex]?.role === 'assistant' && prev[lastAssistantIndex].quickReplies) {
          return prev.map((m, i) =>
            i === lastAssistantIndex ? { ...m, quickReplies: undefined } : m
          );
        }
        return prev;
      });
    }

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
          
          // Parse quick replies from the complete assistant response
          const { content: parsedContent, quickReplies } = parseQuickReplies(assistantContent);
          
          // Update the last assistant message with parsed content and quick replies
          setMessages((prev) => {
            const lastIndex = prev.length - 1;
            if (prev[lastIndex]?.role === 'assistant') {
              return prev.map((m, i) =>
                i === lastIndex ? { ...m, content: parsedContent, quickReplies } : m
              );
            }
            return prev;
          });
          
          // Check if this is the trigger message for report generation
          if (parsedContent.includes("Perfect! I have everything I need. Let me generate your personalized facility report")) {
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
      
      // Step 1: Dispatch lead to backend (Google Sheets sync + DB save)
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
      
      // Step 2: Send lead emails
      try {
        console.log('📧 [FacilityChatWidget] Sending lead emails...');
        
        const emailPayload = {
          customerEmail: leadData.email,
          customerName: leadData.name,
          leadData: {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || '',
            city: extractedParams?.city || leadData.city || '',
            state: extractedParams?.state || leadData.state || '',
            allowOutreach: true,
          },
          facilityDetails: {
            sport: extractedParams?.sports || 'Multi-sport',
            projectType: 'Sports Facility',
            size: extractedParams?.facilitySize || 'Medium',
            sports: extractedParams?.sports?.split(', ') || [],
          },
          estimates: {
            totalInvestment: extractedParams?.estimatedBudget,
            monthlyRevenue: extractedParams?.estimatedMonthlyRevenue,
            annualRevenue: extractedParams?.estimatedMonthlyRevenue 
              ? extractedParams.estimatedMonthlyRevenue * 12 
              : undefined,
          },
          source: 'ai-chat',
        };

        const { error: emailError } = await supabase.functions.invoke('send-lead-emails', {
          body: emailPayload,
        });

        if (emailError) {
          console.error('❌ [FacilityChatWidget] Email sending failed:', emailError);
          // Don't throw - lead was still saved successfully
        } else {
          console.log('✅ [FacilityChatWidget] Emails sent successfully');
        }
      } catch (emailErr) {
        console.error('❌ [FacilityChatWidget] Email error:', emailErr);
        // Continue anyway - lead is saved
      }
      
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
        content: "Welcome! I'm here to help you plan your sports facility. Let's get started by choosing your planning mode:",
        timestamp: new Date(),
        quickReplies: [
          {
            id: 'fast',
            label: '⚡ Fast / Basic',
            value: 'I want the Fast / Basic mode - give me a quick estimate',
            icon: '⚡'
          },
          {
            id: 'advanced',
            label: '🎯 Advanced',
            value: 'I want the Advanced mode - guide me through more details',
            icon: '🎯'
          },
          {
            id: 'expert',
            label: '🔬 Expert / Detailed',
            value: 'I want the Expert / Detailed mode - full comprehensive analysis',
            icon: '🔬'
          }
        ]
      },
    ]);
    setInput('');
    setIsStreaming(false);
    setIsGeneratingReport(false);
    setShowLeadGate(false);
    setExtractedParams(null);
    setSelectedMode(null);
    toast({
      title: 'Chat Reset',
      description: 'Starting a fresh conversation.',
    });
  };

  // Calculate progress based on mode and collected info
  const calculateProgress = () => {
    if (!selectedMode) return 0;
    
    const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
    const hasSports = /basketball|volleyball|pickleball|soccer|tennis|baseball|turf|multi-sport|hockey|lacrosse/i.test(conversationText);
    const hasSize = /square feet|sq\.? ?ft|small|medium|large|(\d+,?\d*)\s*sf/i.test(conversationText);
    const hasLocation = /[A-Z][a-z]+,?\s+[A-Z]{2}/.test(messages.map(m => m.content).join(' '));
    const hasBudget = /budget|\$\d|million|cost|afford/i.test(conversationText);
    const hasTimeline = /timeline|month|year|soon|immediately/i.test(conversationText);
    const hasBuildMode = /new construction|retrofit|existing|lease|buy/i.test(conversationText);
    
    const required = {
      fast: 3,
      advanced: 6,
      expert: 10
    }[selectedMode];
    
    let collected = 0;
    if (hasSports) collected++;
    if (hasSize) collected++;
    if (hasLocation) collected++;
    if (hasBudget && selectedMode !== 'fast') collected++;
    if (hasTimeline && selectedMode !== 'fast') collected++;
    if (hasBuildMode && selectedMode !== 'fast') collected++;
    
    return Math.min((collected / required) * 100, 100);
  };

  return (
    <>
      <Card className="fixed bottom-4 right-4 w-full max-w-md h-[600px] flex flex-col shadow-2xl border-primary/20 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">AI Facility Planner</h3>
            {selectedMode && (
              <Badge 
                variant={selectedMode === 'fast' ? 'default' : selectedMode === 'advanced' ? 'secondary' : 'outline'}
                className="text-xs mt-0.5 bg-white/20 hover:bg-white/30"
              >
                {selectedMode === 'fast' && '⚡ Fast Mode'}
                {selectedMode === 'advanced' && '🎯 Advanced Mode'}
                {selectedMode === 'expert' && '🔬 Expert Mode'}
              </Badge>
            )}
          </div>
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

      {/* Progress Bar for Advanced/Expert modes */}
      {selectedMode && selectedMode !== 'fast' && (
        <div className="px-4 pt-3 pb-2 bg-muted/30">
          <Progress value={calculateProgress()} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {Math.round(calculateProgress())}% complete
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <div
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

            {/* Quick-reply buttons (only for assistant messages) */}
            {message.role === 'assistant' && message.quickReplies && message.quickReplies.length > 0 && (
              <div className={cn(
                "flex flex-col gap-2 ml-2",
                index === 0 && "gap-3"
              )}>
                {message.quickReplies.map((reply) => {
                  const isModeButton = ['fast', 'advanced', 'expert'].includes(reply.id);
                  
                  return (
                    <Button
                      key={reply.id}
                      variant="default"
                      size={isModeButton ? "lg" : "sm"}
                      onClick={() => handleSend(reply.value, true)}
                      disabled={isStreaming || isGeneratingReport}
                      className={cn(
                        isModeButton 
                          ? "w-full justify-start text-left py-6 px-4 h-auto shadow-md hover:shadow-lg transition-all" 
                          : "text-xs px-3 py-1.5 h-auto rounded-full bg-primary/20 hover:bg-primary/30 text-foreground border border-primary/40 transition-all",
                        reply.id === 'fast' && "bg-success hover:bg-success/90 text-success-foreground",
                        reply.id === 'advanced' && "bg-primary hover:bg-primary/90 text-primary-foreground",
                        reply.id === 'expert' && "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                      )}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold flex items-center gap-2">
                          {reply.icon && <span className="text-lg">{reply.icon}</span>}
                          {reply.label}
                        </span>
                        {isModeButton && (
                          <span className="text-xs opacity-90 font-normal">
                            {reply.id === 'fast' && '3-4 quick questions • 2 min estimate'}
                            {reply.id === 'advanced' && '6-8 guided questions • 5 min projection'}
                            {reply.id === 'expert' && '10+ detailed questions • Complete analysis'}
                          </span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
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
