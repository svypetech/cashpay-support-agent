import { useState } from "react";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { ChatUser } from "@/lib/types/chat";
import Search from "../../ui/Search";
import useChatPreviews from "@/hooks/getPreviewChats";

interface ChatListProps {
  onChatSelect: (user: ChatUser, chatId: string) => void;
  activeChat?: string;
}

export default function ChatList({ onChatSelect, activeChat }: ChatListProps) {
  // ✅ Simple state management without URL dependency
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Convert tab to API parameters
  const getApiParams = () => {
    switch (activeTab) {
      case "Unread":
        return { isRead: false, isReplied: undefined };
      case "Unreplied":
        return { isRead: undefined, isReplied: false };
      default:
        return { isRead: undefined, isReplied: undefined };
    }
  };

  const { isRead, isReplied } = getApiParams();

  // ✅ Use the custom hook - parameters will be sent to backend API
  const {
    chatPreviews,
    isLoading,
    isLoadingMore,
    isError,
    hasMore,
    totalCount,
    loadMoreChatPreviews,
    refreshChatPreviews
  } = useChatPreviews({
    limit: 20,
    isRead,     // ✅ Will be added to backend URL as ?isRead=false
    isReplied,  // ✅ Will be added to backend URL as ?isReplied=false
    search: searchQuery, // ✅ Will be added to backend URL as ?search=searchterm
  });

  // ✅ Helper function to format date
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  // ✅ Helper function to convert ChatPreview to ChatUser
  const convertToChatUser = (chat: any): ChatUser => {
    return {
      userName: chat.userName || {
        firstName: "Unknown",
        lastName: "User"
      },
      userImage: chat.userImage,
    };
  };

  // ✅ Handle tab change - triggers new API call with updated parameters
  const handleTabChange = (tab: string) => {
    console.log(`🏷️ Tab changed to: ${tab}`);
    setActiveTab(tab);
    // The hook will automatically refetch with new isRead/isReplied parameters and show loading skeleton
  };

  // ✅ Handle search - triggers new API call with search parameter
  const handleSearch = (query: string) => {
    console.log(`🔍 Search changed to: "${query}"`);
    setSearchQuery(query);
    // The hook will automatically refetch with new search parameter and show loading skeleton
  };

  // ✅ Get current filter description for display
  const getFilterDescription = () => {
    const filters = [];
    
    if (activeTab !== "All") {
      filters.push(activeTab.toLowerCase());
    }
    
    if (searchQuery) {
      filters.push(`"${searchQuery}"`);
    }
    
    return filters.length > 0 ? ` for ${filters.join(" + ")}` : "";
  };
  
  return (
    <div className="flex flex-col min-h-[650px]">
      {/* Header with bottom border */}
      <div className="p-6 border-b border-primary7/30">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chats</h1>
          <button
            onClick={refreshChatPreviews}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh chats"
            disabled={isLoading}
          >
            <span className={`text-lg ${isLoading ? 'animate-spin' : ''}`}>
              🔄
            </span>
          </button>
        </div>
        {/* Show total count with filter description */}
        {totalCount > 0 && !isLoading && (
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} chat{totalCount !== 1 ? 's' : ''}{getFilterDescription()}
          </p>
        )}
        {/* Show loading indicator in header */}
        {isLoading && (
          <p className="text-sm text-gray-500 mt-1">
            Loading chats{getFilterDescription()}...
          </p>
        )}
      </div>
      
      {/* Filter tabs with consistent border */}
      <div className="flex border-b border-primary7/30">
        {["All", "Unread", "Unreplied"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab 
                ? "border-b-2 border-primary text-primary" 
                : "text-gray-500 hover:text-gray-700"
            } ${isLoading ? 'opacity-50' : ''}`}
            onClick={() => handleTabChange(tab)}
            disabled={isLoading}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Search with bottom border - ✅ Removed disabled prop */}
      <div className="p-4 border-b border-primary7/30">
        <Search 
          onSearch={handleSearch}
          className=""
          placeholder="Search chats..."
          value={searchQuery}
        />
      </div>
      
      {/* Chat list with infinite scroll */}
      <div className="flex-1 overflow-hidden">
        {isError ? (
          <div className="p-4 text-center">
            <div className="text-red-500 mb-2">Error: {isError}</div>
            <button 
              onClick={refreshChatPreviews}
              className="text-primary underline hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Try Again'}
            </button>
          </div>
        ) : (
          <div
            id="chat-list-scrollable"
            className="h-full overflow-y-auto"
            style={{ height: '100%' }}
          >
            {/* ✅ Show loading skeleton when isLoading is true (initial load OR filter change) */}
            {isLoading ? (
              <div className="space-y-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-primary7/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatPreviews.length > 0 ? (
              <InfiniteScroll
                dataLength={chatPreviews.length}
                next={loadMoreChatPreviews}
                hasMore={hasMore}
                loader={
                  <div className="p-4 text-center">
                    <div className="text-sm text-gray-500">Loading more chats...</div>
                  </div>
                }
                endMessage={
                  <div className="p-4 text-center">
                    <div className="text-sm text-gray-400">
                      {chatPreviews.length === 0 
                        ? "No chats found" 
                        : `All ${chatPreviews.length} chats loaded`
                      }
                    </div>
                  </div>
                }
                scrollableTarget="chat-list-scrollable"
                style={{ overflow: 'visible' }}
              >
                {chatPreviews.map((chat, index) => (
                  <div 
                    key={chat.ticketId}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      activeChat === chat.ticketId ? "bg-gray-50" : ""
                    } ${index !== 0 ? "border-t border-primary7/30" : ""}`}
                    onClick={() => onChatSelect(convertToChatUser(chat), chat.ticketId)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center overflow-hidden">
                        {chat.userImage ? (
                          <Image
                            src={chat.userImage}
                            alt={chat.userName?.firstName || "User"}
                            width={40}
                            height={40}
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              (target.nextElementSibling as HTMLElement)!.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback initials */}
                        <span 
                          className={`text-sm font-medium text-gray-600 ${chat.userImage ? 'hidden' : 'flex'} items-center justify-center`}
                        >
                          {chat.userName ? chat.userName.firstName.charAt(0) : "?"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {chat.userName 
                            ? `${chat.userName.firstName} ${chat.userName.lastName}`
                            : "Unknown User"
                          }
                        </h3>
                        <span className="text-[10px] font-[200] text-secondary ml-2 flex-shrink-0">
                          {formatTimestamp(chat.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">{chat.message}</p>
                    </div>
                  </div>
                ))}
              </InfiniteScroll>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No chats found{getFilterDescription()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}