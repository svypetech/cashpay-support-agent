import { useState } from "react";
import Tabs from "@/components/support-requests/Tabs";
import Search from "./Search";
import Sort from "./Sort";
import { supportRequestsData as Data } from "@/utils/SupportRequestsData";
import { supportRequestHeadings as headings } from "@/utils/SupportRequestsData";
import UserTable from "@/components/tables/UserTable";
import Pagination from "@/components/tables/pagination/pagination";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { ChatUser } from "@/lib/types/chat";
import { sampleMessages } from "@/utils/chat/utils";


export default function MainSection() {
  const [data, setData] = useState(Data);
  const [filteredData, setFilteredData] = useState(Data);
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Unassigned", "Assigned"];
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(15);
  
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string>("");

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (value: string) => {
    const filtered = data.filter((item) =>
      item.userId.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  // Handle chat click from table
  const handleChatClick = (supportRequest: any) => {
    setCurrentChatUser({
      name: supportRequest.userId || "John Doe", // Replace with actual field name
      email: supportRequest.email || "johndoe@gmail.com", // Replace with actual field name
      avatar: supportRequest.avatar, // Optional
    });
    setCurrentChatId(supportRequest.ticketId || supportRequest.id || Date.now().toString());
    setChatSidebarOpen(true);
  };

  // Handle sending message
  

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          size="small"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        <Search className="sm:w-[80%] w-full" onSearch={handleSearch} />
        <Sort className="sm:w-[20%] w-full" />
      </div>
      
      <UserTable 
        headings={headings} 
        data={filteredData} 
        onChatClick={handleChatClick} 
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Chat Sidebar */}
      {currentChatUser && (
        <ChatSidebar
          isOpen={chatSidebarOpen}
          onClose={() => setChatSidebarOpen(false)}
          chatId={currentChatId}
          user={currentChatUser}
          initialMessages={sampleMessages}
          
        />
      )}
    </div>
  );
}
