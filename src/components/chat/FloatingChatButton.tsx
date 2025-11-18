import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingChatButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingChatButton = ({ onClick, className }: FloatingChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "h-14 w-14 rounded-full shadow-2xl",
        "bg-gradient-primary hover:bg-gradient-primary/90",
        "hover:scale-110 transition-all duration-300",
        "group",
        className
      )}
      aria-label="Chat with AI"
    >
      <MessageCircle className="h-6 w-6 text-white group-hover:animate-bounce" />
      
      {/* Tooltip on hover */}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg pointer-events-none">
        Chat with AI
      </span>
    </Button>
  );
};
