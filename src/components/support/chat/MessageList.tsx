import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Message } from '@/lib/types/chat';
import { groupMessagesByDate } from '@/utils/chat/functions';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export default function MessageList({ messages, className }: MessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Force scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [messages]);

  const messageGroups = groupMessagesByDate(messages);

  // Format date in a user-friendly way
  const formatChatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid
      }
      
      if (isToday(date)) {
        return 'Today';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        // For this year, show month and day
        const currentYear = new Date().getFullYear(); 
        const messageYear = date.getFullYear();
        
        if (messageYear === currentYear) {
          // Within last 7 days, show day name
          const dayDiff = differenceInDays(new Date(), date);
          if (dayDiff < 7) {
            return format(date, 'EEEE'); // Monday, Tuesday, etc.
          }
          
          // Same year but older than 7 days
          return format(date, 'MMMM d'); // May 16
        } else {
          // Different year
          return format(date, 'MMM d, yyyy'); // May 16, 2024
        }
      }
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString; // Return original on error
    }
  };
  
  return (
    <div 
      className={`flex-1 ${className} md:h-full overflow-y-auto p-4 space-y-4`}
      ref={messagesContainerRef}
      style={{ 
        WebkitOverflowScrolling: 'touch', 
      }}
    >
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* Date with horizontal lines */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-[1px] bg-primary7 flex-grow"></div>
            <span className="text-xs text-primary2 font-[500] px-3">
              {formatChatDate(group.date)}
            </span>
            <div className="h-[1px] bg-primary7 flex-grow"></div>
          </div>
          
          {group.messages.map((message) => (
            <MessageItem key={message._id} message={message} />
          ))}
        </div>
      ))}
      {/* Empty div at bottom to scroll to */}
      <div className="h-1"></div>
    </div>
  );
}