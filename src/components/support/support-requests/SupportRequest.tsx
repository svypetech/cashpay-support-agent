// import { useEffect, useState } from "react";

// import Search from "../../ui/Search";
// import Sort from "../../ui/Sort";
// import SupportRequestTable from "@/components/tables/SupportRequestTable";
// import Pagination from "@/components/pagination/pagination";
// import ChatSidebar from "@/components/support/chat/ChatSidebar";
// import { ChatUser } from "@/lib/types/chat";

// import useSupportRequestData from "@/hooks/useFetchSupportRequestData";
// import { SupportRequest } from "@/lib/types/SupportRequest";
// import SkeletonTableLoader from "@/components/skeletons/SkeletonTableLoader";
// import useFetchChat from "@/hooks/useFetchChat";

// const headings = [
//   "Ticket ID",
//   "User ID",
//   "Issue Type",
//   "Status",
//   "Date Created",
//   "Chat",
//   "Mark Resolved",
// ];

// const sortOptions = [
//   { label: "None", value: "" },
//   { label: "Date", value: "date" },
//   { label: "Status", value: "status" },
// ];
// export default function MainSection() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
//   const [currentChatId, setCurrentChatId] = useState<string>("");
//   const [sortBy, setSortBy] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   const { requests, isLoading, isError, totalPages, setRequests } =
//     useSupportRequestData({
//       currentPage,
//       sortBy,
//       searchQuery,
//     });

//   const {
//     messages,
//     isLoading: isChatLoading,
//     isError: isChatError,
//     currentChatUser,
//     setMessages,
//     setCurrentChatUser,
//   } = useFetchChat({ chatId: currentChatId, setChatSidebarOpen });

//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

  

//   // Handle chat click from table
//   const handleChatClick = (supportRequest: SupportRequest) => {
//     setCurrentChatId(supportRequest._id);
//   };
//   const handleChatClose = () => {
//     setChatSidebarOpen(false);
//     setCurrentChatId("");
//     setMessages([]);
//     setCurrentChatUser({} as ChatUser);
//   };

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, sortBy]);

//   // Handle sending message

//   return (
//     <div className="flex flex-col gap-4 relative">
//       <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
//         <Search className="sm:w-[70%] w-full" onSearch={setSearchQuery} />
//         <Sort
//           className="sm:w-[30%] w-full"
//           title="Sort"
//           options={sortOptions}
//           onSort={setSortBy}
//         />
//       </div>
//       {isLoading ? (
//         <SkeletonTableLoader headings={headings} />
//       ) : (
//         <SupportRequestTable
//           headings={headings}
//           supportRequests={requests}
//           onChatClick={handleChatClick}
//           setRequests={setRequests}
//         />
//       )}

//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={handlePageChange}
//       />

//       {/* Chat Sidebar */}

//       <ChatSidebar
//         isOpen={chatSidebarOpen}
//         onClose={handleChatClose}
//         chatId={currentChatId}
//         user={currentChatUser}
//         initialMessages={messages}
//         isLoading={isChatLoading}
//         isError={isChatError}
//       />
//     </div>
//   );
// }
import { useEffect, useState } from "react";

import Search from "../../ui/Search";
import Sort from "../../ui/Sort";
import SupportRequestTable from "@/components/tables/SupportRequestTable";
import Pagination from "@/components/pagination/pagination";
import ChatSidebar from "@/components/support/chat/ChatSidebar";
import { ChatUser } from "@/lib/types/chat";

import useSupportRequestData from "@/hooks/useFetchSupportRequestData";
import { SupportRequest } from "@/lib/types/SupportRequest";
import SkeletonTableLoader from "@/components/skeletons/SkeletonTableLoader";
import useFetchChat from "@/hooks/useFetchChat";

const headings = [
  "Ticket ID",
  "User ID",
  "Issue Type",
  "Status",
  "Date Created",
  "Chat",
  "Mark Resolved",
];

const sortOptions = [
  { label: "None", value: "" },
  { label: "Date", value: "date" },
  { label: "Status", value: "status" },
];

export default function MainSection() {
  const [currentPage, setCurrentPage] = useState(1);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { requests, isLoading, isError, totalPages, setRequests } =
    useSupportRequestData({
      currentPage,
      sortBy,
      searchQuery,
    });

  const {
    messages,
    isLoading: isChatLoading,
    isLoadingMore,
    isError: isChatError,
    currentChatUser,
    setMessages,
    setCurrentChatUser,
    loadMoreMessages,
    hasMore
  } = useFetchChat({ chatId: currentChatId, setChatSidebarOpen });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle chat click from table
  const handleChatClick = (supportRequest: SupportRequest) => {
    setCurrentChatId(supportRequest._id);
  };
  
  const handleChatClose = () => {
    setChatSidebarOpen(false);
    setCurrentChatId("");
    setMessages([]);
    setCurrentChatUser({} as ChatUser);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        <Search className="sm:w-[70%] w-full" onSearch={setSearchQuery} />
        <Sort
          className="sm:w-[30%] w-full"
          title="Sort"
          options={sortOptions}
          onSort={setSortBy}
        />
      </div>
      {isLoading ? (
        <SkeletonTableLoader headings={headings} />
      ) : (
        <SupportRequestTable
          headings={headings}
          supportRequests={requests}
          onChatClick={handleChatClick}
          setRequests={setRequests}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Chat Sidebar with Infinite Scroll */}
      <ChatSidebar
        isOpen={chatSidebarOpen}
        onClose={handleChatClose}
        chatId={currentChatId}
        user={currentChatUser}
        initialMessages={messages}
        isLoading={isChatLoading}
        isError={isChatError}
        loadMoreMessages={loadMoreMessages}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
      />
    </div>
  );
}