import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineChatInputProps {
  onSend: (message: string) => void;
}

interface ModeButton {
  id: 'fast' | 'advanced' | 'expert';
  icon: string;
  label: string;
  description: string;
  color: string;
  hoverColor: string;
}

const modeButtons: ModeButton[] = [
  {
    id: 'fast',
    icon: '⚡',
    label: 'Fast / Basic',
    description: '3-4 quick questions • 2 min estimate',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600'
  },
  {
    id: 'advanced',
    icon: '🎯',
    label: 'Advanced',
    description: '6-8 guided questions • 5 min projection',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'expert',
    icon: '🔬',
    label: 'Expert / Detailed',
    description: '10+ detailed questions • Complete analysis',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600'
  }
];

export const InlineChatInput = ({ onSend }: InlineChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  const handleModeSelect = (mode: 'fast' | 'advanced' | 'expert') => {
    const modeMessages = {
      fast: 'I want the Fast / Basic mode - give me a quick estimate',
      advanced: 'I want the Advanced mode - guide me through more details',
      expert: 'I want the Expert / Detailed mode - full comprehensive analysis'
    };
    onSend(modeMessages[mode]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-primary rounded-lg blur opacity-30 group-hover:opacity-50 transition-smooth"></div>
        <div className="relative bg-card rounded-lg border-2 border-primary/20 shadow-elegant hover:shadow-glow transition-smooth">
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0 pt-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your facility in your own words e.g. 'I want to open a baseball training facility with 8 cages'"
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base placeholder:text-muted-foreground/60"
              aria-label="Chat with AI about your facility"
            />
          </div>
          
          {/* Mode Selection Buttons */}
          <div className="px-4 pb-4">
            <div className="mb-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Choose your planning mode:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {modeButtons.map((mode) => (
                <Button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={cn(
                    "h-auto py-4 px-4 flex flex-col items-start gap-1 text-left",
                    mode.color,
                    mode.hoverColor,
                    "text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  )}
                >
                  <span className="font-semibold flex items-center gap-2 text-base">
                    <span className="text-lg">{mode.icon}</span>
                    {mode.label}
                  </span>
                  <span className="text-xs opacity-90 font-normal">
                    {mode.description}
                  </span>
                </Button>
              ))}
            </div>
            
            {/* Send button for free-form text */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        💡 Start with a planning mode or describe your vision in your own words
      </p>
    </div>
  );
};
