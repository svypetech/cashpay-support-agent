import { useEffect, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message, ChatUser } from "@/lib/types/chat";
import axios from "axios";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
import ChatHeaderSkeleton from "@/components/skeletons/ChatHeaderSkeleton";
interface ChatProps {
  chatId: string;
  user: ChatUser;
  initialMessages?: Message[];

  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
  isLoading?: boolean;
  isError?: string | null;
}

export default function Chat({
  chatId,
  user,
  initialMessages = [],
  onClose,
  showHeader = true,
  className,
  isLoading,
  isError,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const handleSendMessage = (text: string, file?: File) => {
    // Create new message object
    const newMessage: Message = {
      _id: Date.now().toString(),
      message: text,
      isRead: false,
      isReplied: false,
      senderType: "user",
      ticketId: chatId,
      date: new Date().toISOString(),
      sender: user.userName.firstName,
      __v: 0,
    };

    // Add attachment if file is provided
    if (file) {
      // newMessage.attachment = {
      //   name: file.name,
      //   size: `${new Date().toLocaleDateString("en-US", {
      //     day: "2-digit",
      //     month: "short",
      //     year: "numeric",
      //   })} • ${Math.round(file.size / 1024)} KB`,
      //   type: file.type.split("/").pop() || "file",
      //   url: URL.createObjectURL(file),
      // };
    }

    // Update messages state
    setMessages([...messages, newMessage]);

    // Call parent handler if provided
    // if (onSendMessage) {
    // //   sendMessageFunction
    // }
  };
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  return (
    <div className={`flex flex-col bg-white h-full font-inter`}>
      {isLoading ? (
        <ChatHeaderSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center h-full">
          <p>Error: {isError}</p>
        </div>
      ) : (
        showHeader &&
        user.userName != null && <ChatHeader user={user} onClose={onClose} />
      )}
      {isLoading ? (
        <MessageListSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center h-full">
          <p>Error: {isError}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} className={className} />
        </div>
      )}

      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
}
