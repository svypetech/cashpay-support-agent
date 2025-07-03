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
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
    isRead,
    isReplied,
    search: searchQuery,
  });

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

  const convertToChatUser = (chat: any): ChatUser => {
    return {
      userName: chat.userName || {
        firstName: "Unknown",
        lastName: "User"
      },
      userImage: chat.userImage,
    };
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
    <div className="flex flex-col h-full w-full bg-white">
      {/* ✅ Header - Fixed height */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-primary7/30">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">Chats</h1>
        </div>
        {/* Show total count or loading */}
        {isLoading ? (
          <p className="text-sm text-gray-500 mt-1">
            Loading chats{getFilterDescription()}...
          </p>
        ) : totalCount > 0 ? (
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} chat{totalCount !== 1 ? 's' : ''}{getFilterDescription()}
          </p>
        ) : null}
      </div>
      
      {/* ✅ Filter tabs - Fixed height */}
      <div className="flex-shrink-0 flex border-b border-primary7/30">
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
      
      {/* ✅ Search - Fixed height */}
      <div className="flex-shrink-0 p-4 border-b border-primary7/30">
        <Search 
          onSearch={handleSearch}
          className=""
          placeholder="Search chats..."
          value={searchQuery}
        />
      </div>
      
      {/* ✅ Chat list - Flexible height with proper mobile scrolling */}
      <div className="flex-1 min-h-0 overflow-hidden">
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
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{ 
              height: '100%',
              WebkitOverflowScrolling: 'touch', // ✅ Smooth mobile scrolling
              scrollbarWidth: 'thin' // ✅ Thin scrollbar on Firefox
            }}
          >
            {/* ✅ Loading skeleton */}
            {isLoading ? (
              <div className="space-y-0">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="p-4 border-b border-primary7/30 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12 flex-shrink-0"></div>
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
                    className={`
                      flex items-center gap-3 p-4 
                      hover:bg-gray-50 active:bg-gray-100 
                      cursor-pointer transition-colors
                      border-b border-primary7/30 last:border-b-0
                      ${activeChat === chat.ticketId ? "bg-gray-50" : ""}
                    `}
                    onClick={() => onChatSelect(convertToChatUser(chat), chat.ticketId)}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center overflow-hidden">
                        <Image
                          src={chat.userImage ? chat.userImage : "/images/blank-profile.webp"}
                          alt={chat.userName?.firstName || "User"}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
                          {chat.userName 
                            ? `${chat.userName.firstName} ${chat.userName.lastName}`
                            : "N/A"
                          }
                        </h3>
                        <span className="text-[10px] font-[200] text-secondary flex-shrink-0">
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