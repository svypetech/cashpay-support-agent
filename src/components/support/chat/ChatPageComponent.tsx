"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message, ChatUser } from "@/lib/types/chat";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
import { useSocket } from "@/hooks/useSocket";
import HeaderSkeleton from "@/components/skeletons/HeaderSkeleton";

interface ChatProps {
  chatId: string;
  user: ChatUser;
  initialMessages?: Message[];
  onClose?: () => void;
  showHeader?: boolean;
  className?: string;
  isLoading?: boolean;
  isError?: string | null;
  loadMoreMessages?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

export default function ChatComponent({
  chatId,
  user,
  initialMessages = [],
  onClose,
  showHeader = true,
  className,
  isLoading = false, 
  isError = null, 
  loadMoreMessages = () => {},
  isLoadingMore = false,
  hasMore = false,
}: ChatProps) {
  const { sendMessage, onNewMessage, isConnected } = useSocket();
  
  // ✨ DUAL ARRAY SYSTEM
  const [apiMessages, setApiMessages] = useState<Message[]>(initialMessages); // From API/infinite scroll
  const [socketMessages, setSocketMessages] = useState<Message[]>([]); // From real-time socket
  const [tempMessages, setTempMessages] = useState<Map<string, Message>>(new Map()); // Temporary loading states
  
  const [sendingMessage, setSendingMessage] = useState(false);
  const socketConnectionTime = useRef<number>(Date.now());

  // 🔄 COMBINED MESSAGES FOR DISPLAY
  const allMessages = useCallback(() => {
    // Combine API messages + socket messages, remove duplicates, sort by date
    const combined = [...apiMessages, ...socketMessages];
    
    // Remove duplicates by ID (socket messages take precedence over API messages)
    const uniqueMessages = combined.reduce((acc, current) => {
      const existing = acc.find(msg => msg._id === current._id);
      if (!existing) {
        acc.push(current);
      } else if (current._id.startsWith('temp-') && !existing._id.startsWith('temp-')) {
        // Replace temp with real message
        const index = acc.findIndex(msg => msg._id === existing._id);
        acc[index] = existing; // Keep the real message
      }
      return acc;
    }, [] as Message[]);
    
    // Sort by date
    return uniqueMessages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [apiMessages, socketMessages]);

  // HANDLE NEW MESSAGES FROM SOCKET
  useEffect(() => {
    const cleanupListener = onNewMessage((newMessages, isRefetch) => {
      if (isRefetch) {
        setApiMessages(prev => {
          const existingIds = new Set([...prev.map(m => m._id), ...socketMessages.map(m => m._id)]);
          const trulyNewMessages = newMessages.filter(msg => !existingIds.has(msg._id));
          
          if (trulyNewMessages.length > 0) {
            return [...prev, ...trulyNewMessages];
          }
          return prev;
        });
      } else {
        const newMessage = newMessages[0];
        
        if (newMessage && newMessage.ticketId === chatId) {
          let tempIdToReplace = '';
          tempMessages.forEach((tempMsg, tempId) => {
            if (tempMsg.message === newMessage.message) {
              tempIdToReplace = tempId;
            }
          });
          
          if (tempIdToReplace) {
            setTempMessages(prev => {
              const updated = new Map(prev);
              updated.delete(tempIdToReplace);
              return updated;
            });
            
            setSocketMessages(prev => 
              prev.map(msg => msg._id === tempIdToReplace ? newMessage : msg)
            );
          } else {
            setSocketMessages(prev => {
              const exists = prev.some(msg => msg._id === newMessage._id);
              if (!exists) {
                return [...prev, newMessage];
              }
              return prev;
            });
          }
        }
      }
    });
    
    return cleanupListener;
  }, [chatId, onNewMessage, socketMessages, tempMessages]);

  // HANDLE SENDING MESSAGES
  const handleSendMessage = async (text: string, file?: File) => {
    if (!text.trim()) return;
    
    setSendingMessage(true);
    
    try {
      const userInfo = localStorage.getItem("user");
      const currentUserId = userInfo ? JSON.parse(userInfo)._id : null;
      
      const { success, tempId } = await sendMessage(text, chatId);
      
      if (success && tempId) {
        const tempMessage: Message = {
          _id: tempId,
          message: text,
          isRead: false,
          isReplied: false,
          senderType: "support agent", 
          ticketId: chatId,
          date: new Date().toISOString(),
          sender: currentUserId || "agent",
          __v: 0,
        };
        
        setTempMessages(prev => {
          const newMap = new Map(prev).set(tempId, tempMessage);
          return newMap;
        });
        
        setSocketMessages(prev => {
          const updated = [...prev, tempMessage];
          return updated;
        });
        
        if (file) {
          // Handle file attachment if needed
        }
      }
    } catch (error) {
      // Error handling could be improved with toast notifications
    } finally {
      setSendingMessage(false);
    }
  };

  // RESET WHEN CHAT CHANGES
  useEffect(() => {
    setApiMessages(initialMessages);
    setSocketMessages([]);
    setTempMessages(new Map());
    socketConnectionTime.current = Date.now();
  }, [chatId]);

  // 🔄 UPDATE API MESSAGES WHEN INITIAL MESSAGES CHANGE (from infinite scroll)
  useEffect(() => {
    setApiMessages(initialMessages);
  }, [initialMessages]);

  // CLEANUP TEMP MESSAGES AFTER TIMEOUT
  useEffect(() => {
    const interval = setInterval(() => {
      setTempMessages(prev => {
        const updated = new Map(prev);
        let hasChanges = false;
        
        for (const [tempId, tempMsg] of updated.entries()) {
          const age = Date.now() - new Date(tempMsg.date).getTime();
          if (age > 30000) { // Remove temp messages older than 30 seconds
            updated.delete(tempId);
            hasChanges = true;
            
            setSocketMessages(prevSocket => 
              prevSocket.filter(msg => msg._id !== tempId)
            );
          }
        }
        
        return hasChanges ? updated : prev;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // PREPARE DATA FOR DISPLAY
  const displayMessages = allMessages();
  const tempMessageIds = Array.from(tempMessages.keys());

  return (
    <div className={`flex flex-col bg-white h-full font-inter`}>
      {isLoading ? (
        <HeaderSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center h-full">
          <p>Error: {isError}</p>
        </div>
      ) : (
        showHeader && <ChatHeader user={user} onClose={onClose} />
      )}
      
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 text-sm p-2 text-center">
          Connection issue. Messages may not send or receive properly.
        </div>
      )}
      
      {isLoading ? (
        <MessageListSkeleton />
      ) : isError ? (
        <div className="flex items-center justify-center h-full">
          <p>Error: {isError}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <MessageList 
            messages={displayMessages} 
            className={className} 
            currentUserId={getUserIdFromLocalStorage()} 
            tempMessageIds={tempMessageIds}
            onLoadMore={loadMoreMessages}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
        </div>
      )}

      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={sendingMessage || !isConnected}
      />
    </div>
  );
}

function getUserIdFromLocalStorage(): string {
  try {
    const userInfo = localStorage.getItem("user");
    if (!userInfo) return "agent";
    const user = JSON.parse(userInfo);
    return user._id || "agent";
  } catch (error) {
    return "agent";
  }
}
