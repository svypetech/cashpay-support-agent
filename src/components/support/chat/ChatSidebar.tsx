import { useState, useEffect } from 'react';
import Chat from './Chat';
import { ChatUser, Message } from '@/lib/types/chat';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  user: ChatUser;
  initialMessages?: Message[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  chatId,
  user, 
  initialMessages = [], 
  isLoading,
  isError
}: ChatSidebarProps) {
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [shouldSlideIn, setShouldSlideIn] = useState(false);
  
  // Handle visibility and animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // Render the component
      setTimeout(() => {
        setShouldSlideIn(true); // Trigger slide-in animation after mount
      }, 0);
    } else {
      setShouldSlideIn(false); // Start slide-out animation
      const timer = setTimeout(() => {
        setIsVisible(false); // Remove from DOM after animation
      }, 300); // Match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Don't render anything if not visible
  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay backdrop with fade animation */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          shouldSlideIn ? "opacity-30" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar with slide animation */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          shouldSlideIn ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <Chat 
          chatId={chatId}
          user={user}
          initialMessages={initialMessages}
          onClose={onClose}
          showHeader={true}
          className="h-full"
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
}