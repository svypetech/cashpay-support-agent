"use client";
import { useRef, useEffect, useState, useMemo } from 'react';
import MessageItem from './MessageItem';
import { Message } from '@/lib/types/chat';
import { groupMessagesByDate } from '@/utils/chat/functions';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  className?: string;
  currentUserId: string;
  tempMessageIds?: string[];
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export default function MessageList({
  messages,
  className,
  currentUserId,
  tempMessageIds = [],
  onLoadMore,
  isLoadingMore,
  hasMore,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const prevMessageLengthRef = useRef(0);
  const scrollPositionRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null);

  // Memoize message grouping and status
  const processedMessages = useMemo(() => {
    const result = [...messages];
    let lastReadIndex = -1;
    let lastUnreadIndex = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      const msg = result[i];
      const isFromCurrentUser = msg.sender === currentUserId || msg.senderType === "support agent";
      if (isFromCurrentUser) {
        if (msg.isRead && lastReadIndex === -1) lastReadIndex = i;
        else if (!msg.isRead && lastUnreadIndex === -1) lastUnreadIndex = i;
      }
      result[i] = {
        ...msg,
        showStatus: (i === lastReadIndex || i === lastUnreadIndex) &&
          (msg.sender === currentUserId || msg.senderType === "support agent"),
      };
    }
    return result;
  }, [messages, currentUserId]);

  const messageGroups = useMemo(() => groupMessagesByDate(processedMessages), [processedMessages]);

  // On initial load, scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && !initialLoaded) {
      setShouldScrollToBottom(true);
      setInitialLoaded(true);
    }
  }, [messages.length, initialLoaded]);

  // Save scroll position before loading more messages
  useEffect(() => {
    if (isLoadingMore && scrollContainerRef.current) {
      scrollPositionRef.current = {
        scrollTop: scrollContainerRef.current.scrollTop,
        scrollHeight: scrollContainerRef.current.scrollHeight
      };
    }
  }, [isLoadingMore]);

  // Maintain scroll position when new messages are loaded (for pagination)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If messages length increased and we have a saved scroll position (pagination)
    if (messages.length > prevMessageLengthRef.current && scrollPositionRef.current && !shouldScrollToBottom) {
      const heightDifference = container.scrollHeight - scrollPositionRef.current.scrollHeight;
      if (heightDifference > 0) {
        container.scrollTop = scrollPositionRef.current.scrollTop + heightDifference;
      }
      scrollPositionRef.current = null;
    }
    // If we should scroll to bottom (new message sent or initial load)
    else if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      setShouldScrollToBottom(false);
    }
    prevMessageLengthRef.current = messages.length;
  }, [messages.length, shouldScrollToBottom]);

  // Scroll to bottom when new messages arrive (only if already at bottom)
  useEffect(() => {
    if (messagesEndRef.current && initialLoaded) {
      const container = scrollContainerRef.current;
      if (container) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        const isNewMessage = messages.length > prevMessageLengthRef.current && !isLoadingMore;
        if (isAtBottom && isNewMessage) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [messages.length, initialLoaded, isLoadingMore]);

  // Only trigger load more when user scrolls to the very top
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      // Only trigger when at the very top (not at the bottom)
      if (container.scrollTop <= 0 && !isLoadingMore && hasMore) {
        onLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Format date in a user-friendly way
  const formatChatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      const currentYear = new Date().getFullYear();
      const messageYear = date.getFullYear();
      if (messageYear === currentYear) {
        const dayDiff = differenceInDays(new Date(), date);
        if (dayDiff < 7) return format(date, 'EEEE');
        return format(date, 'MMMM d');
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  return (
    <div
      id="scrollableDiv"
      className={`flex-1 ${className} md:h-full overflow-y-auto p-4 flex flex-col`}
      ref={scrollContainerRef}
      style={{ height: '100%' }}
    >
      {/* Loading indicator at the top */}
      {isLoadingMore && (
        <div className="flex justify-center py-2 mb-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Show empty state when there are no messages */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full py-8">
          <div className="bg-gray-100 rounded-full p-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#9CA3AF"/>
              <path d="M12 9H14V11H12V9Z" fill="#9CA3AF"/>
              <path d="M10 9H12V11H10V9Z" fill="#9CA3AF"/>
              <path d="M14 7H16V9H14V7Z" fill="#9CA3AF"/>
            </svg>
          </div>
          <p className="mt-2 text-gray-500">No messages yet</p>
          <p className="text-gray-400 text-sm">Start the conversation by sending a message</p>
        </div>
      ) : (
        messageGroups.map((group, groupIndex, array) => (
          <div
            key={groupIndex}
            className={groupIndex === array.length - 1 ? "" : "mb-6"}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-[1px] bg-primary7 flex-grow"></div>
              <span className="text-xs text-primary2 font-[500] px-3">
                {formatChatDate(group.date)}
              </span>
              <div className="h-[1px] bg-primary7 flex-grow"></div>
            </div>
            <div className="space-y-3 mt-2">
              {group.messages.map((message, index) => {
                const isTemporary = tempMessageIds.includes(message._id) &&
                  message._id.startsWith('temp-');
                return (
                  <MessageItem
                    key={`${message._id}-${index}`}
                    message={message}
                    isFromCurrentUser={message.sender === currentUserId || message.senderType === "support agent"}
                    isTemp={isTemporary}
                    showStatus={message.showStatus}
                  />
                );
              })}
            </div>
          </div>
        ))
      )}
      {/* Always keep this at the bottom for scroll-to-bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// "use client";
// import { useMemo } from 'react';
// import ScrollToBottom from 'react-scroll-to-bottom';
// import MessageItem from './MessageItem';
// import { Message } from '@/lib/types/chat';
// import { groupMessagesByDate } from '@/utils/chat/functions';
// import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

// interface MessageListProps {
//   messages: Message[];
//   className?: string;
//   currentUserId: string;
//   tempMessageIds?: string[];
//   onLoadMore: () => void;
//   isLoadingMore: boolean;
//   hasMore: boolean;
// }

// export default function MessageList({ 
//   messages, 
//   className, 
//   currentUserId,
//   tempMessageIds = [],
//   onLoadMore,
//   isLoadingMore,
//   hasMore
// }: MessageListProps) {
//   // Process messages to only show read status on the most recent read/unread message
//   const processedMessages = useMemo(() => {
//     const result = [...messages];
    
//     // Find the last message from current user that is read and unread
//     let lastReadIndex = -1;
//     let lastUnreadIndex = -1;
    
//     for (let i = result.length - 1; i >= 0; i--) {
//       const msg = result[i];
//       const isFromCurrentUser = msg.sender === currentUserId || msg.senderType === "support agent";
      
//       if (isFromCurrentUser) {
//         if (msg.isRead && lastReadIndex === -1) {
//           lastReadIndex = i;
//         } else if (!msg.isRead && lastUnreadIndex === -1) {
//           lastUnreadIndex = i;
//         }
//       }
      
//       // Add showStatus property to each message
//       result[i] = {
//         ...msg,
//         showStatus: (i === lastReadIndex || i === lastUnreadIndex) && 
//                    (msg.sender === currentUserId || msg.senderType === "support agent")
//       };
//     }
    
//     return result;
//   }, [messages, currentUserId]);

//   // Group messages by date - oldest to newest
//   const messageGroups = useMemo(() => {
//     return groupMessagesByDate(processedMessages);
//   }, [processedMessages]);

//   // Format date in a user-friendly way
//   const formatChatDate = (dateString: string): string => {
//     try {
//       const date = new Date(dateString);
      
//       // Check if valid date
//       if (isNaN(date.getTime())) {
//         return dateString; // Return original if invalid
//       }
      
//       if (isToday(date)) {
//         return 'Today';
//       } else if (isYesterday(date)) {
//         return 'Yesterday';
//       } else {
//         // For this year, show month and day
//         const currentYear = new Date().getFullYear(); 
//         const messageYear = date.getFullYear();
        
//         if (messageYear === currentYear) {
//           // Within last 7 days, show day name
//           const dayDiff = differenceInDays(new Date(), date);
//           if (dayDiff < 7) {
//             return format(date, 'EEEE'); // Monday, Tuesday, etc.
//           }
          
//           // Same year but older than 7 days
//           return format(date, 'MMMM d'); // May 16
//         } else {
//           // Different year
//           return format(date, 'MMM d, yyyy'); // May 16, 2024
//         }
//       }
//     } catch (error) {
//       console.error("Date formatting error:", error);
//       return dateString; // Return original on error
//     }
//   };
  
//   // Handle scroll to top for pagination
//   const handleScrollToTop = (event: React.UIEvent<HTMLDivElement>) => {
//     const target = event.currentTarget;
//     if (target.scrollTop < 30 && hasMore && !isLoadingMore) {
//       onLoadMore();
//     }
//   };
  
//   return (
//     <div className={`flex-1 overflow-hidden ${className || ''}`} style={{ height: '100%' }}>
//       {/* Loading indicator */}
//       {isLoadingMore && (
//         <div className="flex justify-center py-2">
//           <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
//         </div>
//       )}
      
//       <ScrollToBottom
//         className="h-full"
//         followButtonClassName="hidden" // Hide the default follow button
//         initialScrollBehavior="auto"
//         mode="bottom" // Keep scrolled to bottom when new messages arrive
//         onScroll={handleScrollToTop}
//       >
//         {/* Show empty state when there are no messages */}
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full py-8">
//             <div className="bg-gray-100 rounded-full p-4">
//               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#9CA3AF"/>
//                 <path d="M12 9H14V11H12V9Z" fill="#9CA3AF"/>
//                 <path d="M10 9H12V11H10V9Z" fill="#9CA3AF"/>
//                 <path d="M14 7H16V9H14V7Z" fill="#9CA3AF"/>
//               </svg>
//             </div>
//             <p className="mt-2 text-gray-500">No messages yet</p>
//             <p className="text-gray-400 text-sm">Start the conversation by sending a message</p>
//           </div>
//         ) : (
//           <div className="p-4">
//             {/* Display messages in date groups */}
//             {messageGroups.map((group, groupIndex, array) => (
//               <div 
//                 key={groupIndex} 
//                 className={groupIndex === array.length - 1 ? "" : "mb-6"}
//               >
//                 {/* Date with horizontal lines */}
//                 <div className="flex items-center justify-center gap-2 py-2">
//                   <div className="h-[1px] bg-primary7 flex-grow"></div>
//                   <span className="text-xs text-primary2 font-[500] px-3">
//                     {formatChatDate(group.date)}
//                   </span>
//                   <div className="h-[1px] bg-primary7 flex-grow"></div>
//                 </div>
                
//                 {/* Messages for this date group */}
//                 <div className="space-y-3 mt-2">
//                   {group.messages.map((message, index) => {
//                     // Only consider a message temporary if its ID is actually in the tempMessageIds array
//                     // AND it still has a temp- prefix
//                     const isTemporary = tempMessageIds.includes(message._id) && 
//                                        message._id.startsWith('temp-');
                    
//                     return (
//                       <MessageItem 
//                         key={`${message._id}-${index}`} 
//                         message={message} 
//                         isFromCurrentUser={message.sender === currentUserId || message.senderType === "support agent"}
//                         isTemp={isTemporary}
//                         showStatus={message.showStatus}
//                       />
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </ScrollToBottom>
//     </div>
//   );
// }
