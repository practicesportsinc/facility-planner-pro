import { useChat } from "@/contexts/ChatContext";
import { FacilityChatWidget } from "@/components/home/FacilityChatWidget";
import { FloatingChatButton } from "./FloatingChatButton";
import { clearChatHistory } from "@/utils/chatHelpers";

export const GlobalChatWidget = () => {
  const { isChatOpen, openChat, closeChat, initialMessage } = useChat();

  const handleOpenChat = () => {
    clearChatHistory();
    openChat();
  };

  return (
    <>
      {!isChatOpen && <FloatingChatButton onClick={handleOpenChat} />}
      
      {isChatOpen && (
        <FacilityChatWidget 
          onClose={closeChat}
          initialMessage={initialMessage}
        />
      )}
    </>
  );
};
