import Chat from './Chat';
import { ChatUser, Message } from '@/lib/types/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  user: ChatUser;
  initialMessages?: Message[];
  
}

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  chatId,
  user, 
  initialMessages = [], 
  
}: ChatSidebarProps) {
  return (
    <div 
      className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <Chat 
        chatId={chatId}
        user={user}
        initialMessages={initialMessages}
        
        onClose={onClose}
        showHeader={true}
        className="h-full"
      />
    </div>
  );
}