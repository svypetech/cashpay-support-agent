import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Message } from '@/lib/types/chat';
import { groupMessagesByDate } from '@/utils/chat/utils';

interface MessageListProps {
  messages: Message[];
  className?: string;
}

export default function MessageList({ messages, className }: MessageListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // (Optional) Force scroll to bottom when messages change
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

  return (
    <div 
      className={`flex-1 ${className} md:h-full  overflow-y-auto p-4 space-y-4`}
      ref={messagesContainerRef}
      style={{ 
        WebkitOverflowScrolling: 'touch', 
        // explicitly set height on mobile
      }}
    >
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          {/* Date with horizontal lines */}
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="h-[1px] bg-primary7 flex-grow"></div>
            <span className="text-xs text-primary2 font-[500] px-3">{group.date}</span>
            <div className="h-[1px] bg-primary7 flex-grow"></div>
          </div>
          
          {group.messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      ))}
      {/* Empty div at bottom to scroll to */}
      <div className="h-1"></div>
    </div>
  );
}