import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Send } from "lucide-react";

interface InlineChatInputProps {
  onSend: (message: string) => void;
}

export const InlineChatInput = ({ onSend }: InlineChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
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
              placeholder="Describe your facility vision... (e.g., 'I want to build a basketball and volleyball facility in Austin, Texas')"
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-base placeholder:text-muted-foreground/60"
              aria-label="Chat with AI about your facility"
            />
          </div>
          <div className="flex justify-end px-4 pb-4 pt-0">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        💡 Chat with our AI to explore your facility options, or use Quick Estimates or Calculator below
      </p>
    </div>
  );
};
