import { useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message, ChatUser } from "@/lib/types/chat";
interface ChatProps {
  chatId: string;
  user: ChatUser;
  initialMessages?: Message[];
  
  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
}

export default function Chat({
  chatId,
  user,
  initialMessages = [],
  
  onClose,
  showHeader = true,
  className,
}: ChatProps) {


  const [messages, setMessages] = useState<Message[]>(initialMessages);


  
  const handleSendMessage = (text: string, file?: File) => {
    // Create new message object
    const newMessage: Message = {
      id: Date.now().toString(),
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "agent",
    };

    // Add attachment if file is provided
    if (file) {
      newMessage.attachment = {
        name: file.name,
        size: `${new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} • ${Math.round(file.size / 1024)} KB`,
        type: file.type.split("/").pop() || "file",
        url: URL.createObjectURL(file),
      };
    }

    // Update messages state
    setMessages([...messages, newMessage]);

    // Call parent handler if provided
    // if (onSendMessage) {
    // //   sendMessageFunction
    // }
  };

  return (
    <div className={`flex flex-col bg-white h-full font-inter`}>
      {showHeader && <ChatHeader user={user} onClose={onClose} />}
      <MessageList messages={messages} className={className} />
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}


