import { useState } from "react";
import Image from "next/image";
import { ChatUser } from "@/lib/types/chat";
import Search from "../../ui/Search";

interface ChatListProps {
  onChatSelect: (user: ChatUser, chatId: string) => void;
  activeChat?: string;
}

interface ChatPreview {
  id: string;
  user: ChatUser;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export default function ChatList({ onChatSelect, activeChat }: ChatListProps) {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample data - replace with your actual data
  const chatPreviews: ChatPreview[] = [
    {
      id: "chat1",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
      id: "chat2",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: true,
    },
    {
      id: "chat3",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
      id: "chat4",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com", 
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
      id: "chat5",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
      id: "chat6",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
      id: "chat7",
      user: {
        name: "John Doe",
        email: "johndoe@gmail.com",
        avatar: "/images/user-avatar.png",
      },
      lastMessage: "Thanks, will get back to you...",
      timestamp: "28 Mar 9:20am",
      unread: false,
    },
    {
        id: "chat8",
        user: {
          name: "John Doe",
          email: "johndoe@gmail.com",
          avatar: "/images/user-avatar.png",
        },
        lastMessage: "Thanks, will get back to you...",
        timestamp: "28 Mar 9:20am",
        unread: false,
      },
      {
        id: "chat9",
        user: {
          name: "John Doe",
          email: "johndoe@gmail.com",
          avatar: "/images/user-avatar.png",
        },
        lastMessage: "Thanks, will get back to you...",
        timestamp: "28 Mar 9:20am",
        unread: false,
      },
      {
        id: "chat10",
        user: {
          name: "John Doe",
          email: "johndoe@gmail.com",
          avatar: "/images/user-avatar.png",
        },
        lastMessage: "Thanks, will get back to you...",
        timestamp: "28 Mar 9:20am",
        unread: false,
      },
      {
        id: "chat11",
        user: {
          name: "John Doe",
          email: "johndoe@gmail.com",
          avatar: "/images/user-avatar.png",
        },
        lastMessage: "Thanks, will get back to you...",
        timestamp: "28 Mar 9:20am",
        unread: false,
      },
  ];
  
  // Filter chats based on search and active tab
  const filteredChats = chatPreviews.filter(chat => {
    const matchesSearch = searchQuery === "" || 
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case "Unread":
        return chat.unread;
      case "Unreplied":
        return true; // Add logic for unreplied
      default:
        return true;
    }
  });
  
  return (
    <div className="flex flex-col max-h-[718px]">
      {/* Header with bottom border */}
      <div className="p-6 border-b border-primary7/30">
        <h1 className="text-2xl font-bold">Chats</h1>
      </div>
      
      {/* Filter tabs with consistent border */}
      <div className="flex border-b border-primary7/30">
        {["All", "Unread", "Unreplied"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === tab 
                ? "border-b-2 border-primary text-primary" 
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Search with bottom border */}
      <div className="p-4 border-b border-primary7/30">
        <Search 
          onSearch={setSearchQuery}
          className=""
        />
      </div>
      
      {/* Chat list with borders between items */}
      <div className="flex-1 overflow-y-scroll">
        {filteredChats.map((chat, index) => (
          <div 
            key={chat.id}
            className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${
              activeChat === chat.id ? "bg-gray-50" : ""
            } ${index !== 0 ? "border-t border-primary7/30" : ""}`}
            onClick={() => onChatSelect(chat.user, chat.id)}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center overflow-hidden">
                {chat.user.avatar ? (
                  <Image
                    src={chat.user.avatar}
                    alt={chat.user.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span>{chat.user.name.charAt(0)}</span>
                )}
              </div>
              
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <h3 className="font-medium text-sm text-gray-900 truncate">{chat.user.name}</h3>
                <span className="text-[10px]  font-[200] text-secondary">{chat.timestamp}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}