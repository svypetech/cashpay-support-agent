import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import { Message, ChatUser } from "@/lib/types/chat";
import { sampleMessages } from "@/utils/chat/utils";
import Image from "next/image";

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatView, setShowChatView] = useState<boolean>(false);
  
  // Check if we're on mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  // Handle chat selection
  const handleChatSelect = (user: ChatUser, chatId: string) => {
    setActiveChat(chatId);
    setCurrentChatUser(user);
    
    // On mobile, show the chat view when a chat is selected
    if (isMobileView) {
      setShowChatView(true);
    }
  };
  
  // Handle back button click on mobile
  const handleBackToList = () => {
    setShowChatView(false);
  };
  
  // Custom header for mobile chat view with back button
  const MobileChatHeader = ({ user, onBack }: { user: ChatUser, onBack: () => void }) => {
    return (
      <div className="flex items-center p-3 border-b border-primary7/30 bg-white">
        <button onClick={onBack} className="mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm">{user.name}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col max-h-[718px] md:flex-row rounded-lg  border-[5px] border-primary7/30  bg-white">
      {/* Chat list - always visible on desktop, conditional on mobile */}
      <div 
        className={`
          w-full max-h-full md:w-80 md:flex-shrink-0 md:border-r-[3px]  md:border-primary7/30 bg-white
          ${isMobileView && showChatView ? 'hidden' : 'flex flex-col'}
        `}
      >
        <ChatList 
          onChatSelect={handleChatSelect}
          activeChat={activeChat || undefined}
        />
      </div>
      
      {/* Chat area - always visible on desktop, conditional on mobile */}
      <div 
        className={`
          flex-1 flex flex-col
          ${isMobileView && !showChatView ? 'hidden' : 'flex'}
        `}
      >
        {currentChatUser && activeChat ? (
          <>
            {/* Mobile-only back button header */}
            {isMobileView && (
              <MobileChatHeader user={currentChatUser} onBack={handleBackToList} />
            )}
            
            {/* Chat component */}
            <Chat
              chatId={activeChat}
              user={currentChatUser}
              initialMessages={sampleMessages}
              className="w-full h-full max-h-[600px]"
              showHeader={!isMobileView}
              
              // Hide default header on mobile since we have our custom one
            />
          </>
        ) : (
          // Empty state when no chat is selected
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            {isMobileView ? 
              "Select a chat to start messaging" : 
              "Select a conversation from the list"
            }
          </div>
        )}
      </div>
    </div>
  );
}