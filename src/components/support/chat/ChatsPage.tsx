import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import { ChatUser } from "@/lib/types/chat";
import Image from "next/image";
import useFetchChat from "@/hooks/useFetchChat";
import ChatComponent from "./ChatPageComponent";

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatView, setShowChatView] = useState<boolean>(false);
  const [chatViewOpen, setChatViewOpen] = useState<boolean>(false);
  
  // ✅ Use fetchChat hook for infinite scroll and socket functionality
  const {
    messages,
    isLoading: isChatLoading,
    isLoadingMore,
    isError: isChatError,
    currentChatUser: fetchedChatUser,
    setMessages,
    setCurrentChatUser: setFetchedChatUser,
    loadMoreMessages,
    hasMore
  } = useFetchChat({ 
    chatId: activeChat || "", 
    setChatSidebarOpen: setChatViewOpen 
  });
  
  // Check if we're on mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  // ✅ Sync fetched chat user with local state
  useEffect(() => {
    if (fetchedChatUser && Object.keys(fetchedChatUser).length > 0) {
      setCurrentChatUser(fetchedChatUser);
    }
  }, [fetchedChatUser]);
  
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
  
  // ✅ Handle chat close/cleanup
  const handleChatClose = () => {
    setActiveChat(null);
    setCurrentChatUser(null);
    setShowChatView(false);
    setChatViewOpen(false);
    setMessages([]);
    setFetchedChatUser({} as ChatUser);
  };
  
  // Custom header for mobile chat view with back button
  const MobileChatHeader = ({ user, onBack }: { user: ChatUser, onBack: () => void }) => {
    return (
      <div className="flex items-center p-3 border-b border-primary7/30 bg-white flex-shrink-0">
        <button onClick={onBack} className="mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center overflow-hidden">
            <Image 
              src={user.userImage ? user.userImage : "/images/blank-profile.webp"} 
              alt="User avatar" 
              width={32} 
              height={32} 
              className="object-cover rounded-full" 
            />
          </div>
          <div>
            <h3 className="font-medium text-sm">
              {user.userName 
                ? `${user.userName.firstName} ${user.userName.lastName}`
                : "Unknown User"
              }
            </h3>
            {/* <p className="text-xs text-gray-500">Online</p> */}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      {/* ✅ Fixed container with responsive height */}
      <div className={`
        flex flex-col md:flex-row
        w-full
        h-[83vh] md:h-[700px]
        max-h-[100vh] md:max-h-[700px]
        rounded-none md:rounded-lg 
        border-0 md:border-[5px] md:border-primary7/30 
        bg-white
        overflow-hidden
      `}>
        
        {/* ✅ Chat list - Fixed width on desktop, full width on mobile */}
        <div 
          className={`
            w-full md:w-80 md:flex-shrink-0 
            h-full
            md:border-r-[3px] md:border-primary7/30 
            bg-white
            ${isMobileView && showChatView ? 'hidden' : 'flex flex-col'}
          `}
        >
          <ChatList 
            onChatSelect={handleChatSelect}
            activeChat={activeChat || undefined}
          />
        </div>
        
        {/* ✅ Chat area - Takes remaining space */}
        <div 
          className={`
            flex-1 flex flex-col
            h-full
            min-w-0
            ${isMobileView && !showChatView ? 'hidden' : 'flex'}
          `}
        >
          {currentChatUser && activeChat ? (
            <div className="flex flex-col h-full">
              {/* Mobile-only back button header */}
              {isMobileView && (
                <MobileChatHeader user={currentChatUser} onBack={handleBackToList} />
              )}
              
              {/* ✅ Chat component with proper height constraints */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatComponent
                  chatId={activeChat}
                  user={currentChatUser}
                  initialMessages={messages}
                  showHeader={!isMobileView}
                  isLoading={isChatLoading}
                  isError={isChatError}
                  loadMoreMessages={loadMoreMessages}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  onClose={isMobileView ? handleBackToList : undefined}
                />
              </div>
            </div>
          ) : (
            // Empty state when no chat is selected
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              <div className="text-center p-8">
                <div className="mb-4">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isMobileView ? "Select a chat" : "No conversation selected"}
                </h3>
                <p className="text-gray-500">
                  {isMobileView 
                    ? "Choose a chat from the list to start messaging" 
                    : "Select a conversation from the list to view messages"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}