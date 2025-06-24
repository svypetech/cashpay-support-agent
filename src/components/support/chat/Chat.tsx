"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Message, ChatUser } from "@/lib/types/chat";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
import ChatHeaderSkeleton from "@/components/skeletons/ChatHeaderSkeleton";
import { useSocket } from "@/hooks/useSocket";

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

export default function Chat({
  chatId,
  user,
  initialMessages = [],
  onClose,
  showHeader = true,
  className,
  isLoading,
  isError,
  loadMoreMessages = () => {},
  isLoadingMore = false,
  hasMore = false,
}: ChatProps) {
  const { sendMessage, onNewMessage, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [tempMessages, setTempMessages] = useState<Map<string, Message>>(new Map());
  const sentMessagesRef = useRef<Set<string>>(new Set());
  const messageIdsRef = useRef<Set<string>>(new Set());
  
  // Initialize messageIdsRef with existing message IDs
  useEffect(() => {
    messages.forEach(msg => {
      if (msg._id && !msg._id.startsWith('temp-')) {
        messageIdsRef.current.add(msg._id);
      }
    });
  }, []);
  
  // Modified cleanup function - simplified logging
  const cleanupTempMessages = useCallback((newMessage: Message) => {
    console.log("🔄 CLEANUP - New message received:", newMessage._id, newMessage.message);
    
    // LOG: Total messages BEFORE cleanup
    console.log("📊 BEFORE CLEANUP - Total messages:", messages.length);
    console.log("📊 BEFORE CLEANUP - Messages array:", messages.map(m => ({id: m._id, content: m.message.substring(0, 30)})));
    
    setTempMessages(prev => {
        const updatedTemp = new Map(prev);
        let foundMatch = false;
        
        for (const [tempId, tempMsg] of updatedTemp.entries()) {
            if (
                tempMsg.message === newMessage.message || 
                (Date.now() - new Date(tempMsg.date).getTime() < 10000)
            ) {
                updatedTemp.delete(tempId);
                sentMessagesRef.current.delete(tempId);
                foundMatch = true;
                console.log('✅ Removed temp message:', tempId, '-> Replaced with real message:', newMessage._id);
            }
        }
        
        return updatedTemp;
    });

    // LOG: Messages AFTER cleanup (this will show in the next render cycle)
    setTimeout(() => {
      console.log("📊 AFTER CLEANUP - Total messages:", messages.length);
      console.log("📊 AFTER CLEANUP - Messages array:", messages.map(m => ({id: m._id, content: m.message.substring(0, 30)})));
    }, 100); // Small delay to ensure state has updated
  }, [messages, tempMessages]);

  // Listen for new messages coming from the server
  useEffect(() => {
    const cleanupListener = onNewMessage((newMessages, isRefetch) => {
      // Log indicator of what we're processing
      console.log(`Processing ${isRefetch ? 'REFETCH' : 'NEW MESSAGE'} with ${newMessages.length} messages`);
      
      if (isRefetch) {
        // Handle full chat history updates - more careful merge
        const knownMessageIds = new Set(messages.map(msg => msg._id));
        const trulyNewMessages = newMessages.filter(msg => !knownMessageIds.has(msg._id));
        
        console.log(`Found ${trulyNewMessages.length} truly new messages out of ${newMessages.length}`);
        
        if (trulyNewMessages.length > 0) {
          setMessages(prevMessages => {
            // Create a merged set of messages, ensuring no duplicates
            const combinedMessages = [...prevMessages];
            
            // Add only messages we don't already have
            trulyNewMessages.forEach(newMsg => {
              if (!combinedMessages.some(msg => msg._id === newMsg._id)) {
                combinedMessages.push(newMsg);
              }
            });
            
            // Sort by date
            return combinedMessages.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            );
          });
        }
      } else {
        // Individual new message handling (with cleanup)
        const newMessage = newMessages[0];
        
        // Only process messages for this chat
        if (newMessage && newMessage.ticketId === chatId) {
          // Clean up any temporary versions of this message
          cleanupTempMessages(newMessage);
          
          // Only add if we don't already have it
          const messageExists = messages.some(msg => msg._id === newMessage._id);
          if (!messageExists) {
            setMessages(prevMessages => [...prevMessages, newMessage]);
          }
        }
      }
    });
    
    return cleanupListener;
  }, [chatId, onNewMessage, messages, cleanupTempMessages]);
  
  const handleSendMessage = async (text: string, file?: File) => {
    if (!text.trim()) return;
    
    setSendingMessage(true);
    
    try {
      // Current user info from localStorage
      const userInfo = localStorage.getItem("user");
      const currentUserId = userInfo ? JSON.parse(userInfo)._id : null;
      
      // Send message via Socket.IO
      const { success, tempId } = await sendMessage(text, chatId);
      
      if (success && tempId) {
        // Create temporary message object for UI display
        const tempMessage: Message = {
          _id: tempId, // Temporary ID
          message: text,
          isRead: false,
          isReplied: false,
          senderType: "support agent", 
          ticketId: chatId,
          date: new Date().toISOString(),
          sender: currentUserId || "agent", // Fallback to "agent" if userId not found
          __v: 0,
        };
        
        // Track this message as a sent message we should preserve
        sentMessagesRef.current.add(tempId);
        
        // Add to temp messages Map
        setTempMessages(prev => new Map(prev).set(tempId, tempMessage));
        
        // ONLY add to messages state - don't duplicate
        setMessages(prevMessages => [...prevMessages, tempMessage]);
        
        // Handle file attachment if needed
        if (file) {
          console.log("File attachment handling needed:", file);
        }
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Reset messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
    
    // Reset message IDs tracking
    messageIdsRef.current = new Set();
    initialMessages.forEach(msg => {
      if (msg._id) messageIdsRef.current.add(msg._id);
    });
    
    // Clear all temporary messages and sent tracking when chat changes
    setTempMessages(new Map());
    sentMessagesRef.current = new Set();
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
        <ChatHeader user={user} onClose={onClose} />
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
            messages={messages} 
            className={className} 
            currentUserId={getUserIdFromLocalStorage()} 
            tempMessageIds={Array.from(tempMessages.keys())}
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

// Helper function to get current user ID
function getUserIdFromLocalStorage(): string {
  try {
    const userInfo = localStorage.getItem("user");
    if (!userInfo) return "agent"; // Default to "agent" if no user in localStorage
    const user = JSON.parse(userInfo);
    return user._id || "agent";
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return "agent";
  }
}

// import { useEffect, useState, useRef } from "react";

// import ChatHeader from "./ChatHeader";
// import MessageList from "./MessageList";
// import ChatInput from "./ChatInput";
// import { Message, ChatUser } from "@/lib/types/chat";
// import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
// import ChatHeaderSkeleton from "@/components/skeletons/ChatHeaderSkeleton";
// import { useSocket } from "@/hooks/useSocket";

// interface ChatProps {
//   chatId: string;
//   user: ChatUser;
//   initialMessages?: Message[];
//   onClose?: () => void;
//   showHeader?: boolean;
//   className?: string;
//   isLoading?: boolean;
//   isError?: string | null;
//   loadMoreMessages?: () => void;
//   isLoadingMore?: boolean;
//   hasMore?: boolean;
// }

// export default function Chat({
//   chatId,
//   user,
//   initialMessages = [],
//   onClose,
//   showHeader = true,
//   className,
//   isLoading,
//   isError,
//   loadMoreMessages = () => {},
//   isLoadingMore = false,
//   hasMore = false,
// }: ChatProps) {
//   const { sendMessage, onNewMessage, isConnected } = useSocket();
//   const [messages, setMessages] = useState<Message[]>(initialMessages);
//   const [sendingMessage, setSendingMessage] = useState(false);
//   const [tempMessages, setTempMessages] = useState<Map<string, Message>>(new Map());
//   const sentMessagesRef = useRef<Set<string>>(new Set());
  
//   // Listen for new messages coming from the server
//   useEffect(() => {
//     // Set up listener for new messages
//     const cleanupListener = onNewMessage((newMessages, isRefetch) => {
//       if (isRefetch) {
//         // Check if we should preserve our temp messages when receiving a refetch
//         // (sometimes the server's response doesn't include messages we just sent)
//         const tempMessagesToKeep: Message[] = [];
        
//         // Identify which temp messages aren't in the server's response
//         tempMessages.forEach((tempMsg) => {
//           // Check if temp message exists in new messages by content and timestamp
//           const messageExists = newMessages.some(msg => 
//             (msg.message === tempMsg.message && 
//              Math.abs(new Date(msg.date).getTime() - new Date(tempMsg.date).getTime()) < 60000)
//           );
          
//           if (!messageExists && sentMessagesRef.current.has(tempMsg._id)) {
//             tempMessagesToKeep.push(tempMsg);
//           }
//         });

//         // Combine server messages with our temp messages that aren't in the response yet
//         console.log("NEW MESSAGES: ",newMessages)
//         console.log("TEMP MESSAGES TO KEEP: ", tempMessagesToKeep);
//         console.log("CURRENT MESSAGES: ", messages);
//         // Filter out any messages that are already in the current messages state
//         setMessages([...messages, ...newMessages[0], ...tempMessagesToKeep]);
        
//         // Update temp messages if needed
//         if (tempMessagesToKeep.length > 0) {
//           const newTempMap = new Map<string, Message>();
//           tempMessagesToKeep.forEach(msg => {
//             newTempMap.set(msg._id, msg);
//           });
//           setTempMessages(newTempMap);
//         } else {
//           setTempMessages(new Map());
//         }
//       } else {
//         // Single new message
//         const newMessage = newMessages[0];
        
//         // Only process messages for this chat
//         if (newMessage.ticketId === chatId) {
//           // Check if we already have this message (by ID or similar content)
//           const messageExists = messages.some(msg => {
//             // Check by ID
//             if (msg._id === newMessage._id) return true;
            
//             // Check if it's similar to one of our temp messages (same content, similar time)
//             if (tempMessages.has(msg._id) && 
//                 msg.message === newMessage.message &&
//                 Math.abs(new Date(msg.date).getTime() - new Date(newMessage.date).getTime()) < 60000) {
              
//               // Remove the temp message since we got the real one
//               const updatedTempMessages = new Map(tempMessages);
//               updatedTempMessages.delete(msg._id);
//               setTempMessages(updatedTempMessages);
              
//               // Also remove from sent messages tracking
//               sentMessagesRef.current.delete(msg._id);
              
//               return true;
//             }
            
//             return false;
//           });
          
//           if (!messageExists) {
//             // Add to end of array (newest message)
//             setMessages(prevMessages => [...prevMessages, newMessage]);
//           } else {
//             // Replace any temp version with the real message
//             setMessages(prevMessages => 
//               prevMessages.map(msg => 
//                 (msg.message === newMessage.message && 
//                  Math.abs(new Date(msg.date).getTime() - new Date(newMessage.date).getTime()) < 60000)
//                   ? newMessage
//                   : msg
//               )
//             );
//           }
//         }
//       }
//     });
    
//     return cleanupListener;
//   }, [chatId, onNewMessage, messages, tempMessages]);
  
//   const handleSendMessage = async (text: string, file?: File) => {
//     if (!text.trim()) return;
    
//     setSendingMessage(true);
    
//     try {
//       // Current user info from localStorage
//       const userInfo = localStorage.getItem("user");
//       const currentUserId = userInfo ? JSON.parse(userInfo)._id : null;
      
//       // Send message via Socket.IO
//       const { success, tempId } = await sendMessage(text, chatId);
      
//       if (success && tempId) {
//         // Create temporary message object for UI display
//         const tempMessage: Message = {
//           _id: tempId, // Temporary ID
//           message: text,
//           isRead: false,
//           isReplied: false,
//           senderType: "support agent", 
//           ticketId: chatId,
//           date: new Date().toISOString(),
//           sender: currentUserId || "agent", // Fallback to "agent" if userId not found
//           __v: 0,
//         };
        
//         // Track this message as a sent message we should preserve
//         sentMessagesRef.current.add(tempId);
        
//         // Add to temp messages
//         setTempMessages(prev => new Map(prev).set(tempId, tempMessage));
        
//         // Add to messages state
//         setMessages(prevMessages => [...prevMessages, tempMessage]);
        
//         // Handle file attachment if needed
//         if (file) {
//           console.log("File attachment handling needed:", file);
//         }
//       } else {
//         console.error("Failed to send message");
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//     } finally {
//       setSendingMessage(false);
//     }
//   };

//   // Reset messages when initialMessages changes
//   useEffect(() => {
//     setMessages(initialMessages);
//     // Clear all temporary messages and sent tracking when chat changes
//     setTempMessages(new Map());
//     sentMessagesRef.current = new Set();
//   }, [initialMessages]);

//   return (
//     <div className={`flex flex-col bg-white h-full font-inter`}>
//       {isLoading ? (
//         <ChatHeaderSkeleton />
//       ) : isError ? (
//         <div className="flex items-center justify-center h-full">
//           <p>Error: {isError}</p>
//         </div>
//       ) : (
//         showHeader &&
//         user.userName != null && <ChatHeader user={user} onClose={onClose} />
//       )}
      
//       {!isConnected && (
//         <div className="bg-yellow-100 text-yellow-800 text-sm p-2 text-center">
//           Connection issue. Messages may not send or receive properly.
//         </div>
//       )}
      
//       {isLoading ? (
//         <MessageListSkeleton />
//       ) : isError ? (
//         <div className="flex items-center justify-center h-full">
//           <p>Error: {isError}</p>
//         </div>
//       ) : (
//         <div className="flex-1 overflow-y-auto">
//           <MessageList 
//             messages={messages} 
//             className={className} 
//             currentUserId={getUserIdFromLocalStorage()} 
//             tempMessageIds={Array.from(tempMessages.keys())}
//             onLoadMore={loadMoreMessages}
//             isLoadingMore={isLoadingMore}
//             hasMore={hasMore}
//           />
//         </div>
//       )}

//       <ChatInput 
//         onSendMessage={handleSendMessage} 
//         disabled={sendingMessage || !isConnected}
//       />
//     </div>
//   );
// }

// // Helper function to get current user ID
// function getUserIdFromLocalStorage(): string {
//   try {
//     const userInfo = localStorage.getItem("user");
//     if (!userInfo) return "agent"; // Default to "agent" if no user in localStorage
//     const user = JSON.parse(userInfo);
//     return user._id || "agent";
//   } catch (error) {
//     console.error("Error parsing user from localStorage:", error);
//     return "agent";
//   }
// }
