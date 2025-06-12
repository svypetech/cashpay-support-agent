"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { ChatUser, Message } from "@/lib/types/chat";

export default function useFetchChat({chatId, setChatSidebarOpen}: {chatId: string, setChatSidebarOpen: (open: boolean) => void}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser>({} as ChatUser);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const isInitialLoadComplete = useRef(false);
  // Add timeframe tracking to prevent multiple quick loads
  const lastLoadTimeRef = useRef<number>(0);
  // Track if the load was user-initiated
  const userInitiatedLoadRef = useRef(false);

  // Initial load of messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (chatId === "") return;
      
      setChatSidebarOpen(true);
      setIsLoading(true);
      setCurrentPage(1); // Reset to page 1 when chat changes
      isInitialLoadComplete.current = false;
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=20&page=1&ticketId=${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        setMessages(response.data.chat.data.chats || []);
        setCurrentChatUser(response.data.userDetails);
        setTotalPages(response.data.chat.data.totalPages || 1);
        setHasMore(response.data.chat.data.totalPages > 1);
        setIsError(null);
        
        // Set initialization complete after a short delay
        setTimeout(() => {
          isInitialLoadComplete.current = true;
        }, 500);
        
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        setIsError(error.response?.data?.error || "Failed to load messages");
        isInitialLoadComplete.current = true;
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMessages();
  }, [chatId, setChatSidebarOpen]);

  // Function to load more messages (older messages)
  const loadMoreMessages = useCallback(async () => {
    // Multiple checks to prevent excessive loads
    // 1. Already loading
    if (isLoadingMore || chatId === "") return;
    
    // 2. No more pages to load or not initialized
    if (!hasMore || !isInitialLoadComplete.current) return;
    
    // 3. Throttle requests - no more than one every 1000ms, unless user-initiated
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1000 && !userInitiatedLoadRef.current) {
      console.log("Throttling loadMoreMessages call - too frequent");
      return;
    }

    // 4. Block automatic pagination beyond page 2
    const nextPage = currentPage + 1;
    if (nextPage > 2 && !userInitiatedLoadRef.current) {
      console.log("Blocking automatic load beyond page 2");
      return;
    }
    
    lastLoadTimeRef.current = now;
    setIsLoadingMore(true);
    
    try {
      console.log(`Loading more messages: page ${nextPage}`);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=20&page=${nextPage}&ticketId=${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Get older messages
      const olderMessages = response.data.chat.data.chats || [];
      
      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        // Append older messages to the beginning (they are older)
        setMessages(prevMessages => [...olderMessages, ...prevMessages]);
        setCurrentPage(nextPage);
      }
      
    } catch (error: any) {
      console.error("Error fetching more messages:", error);
      setIsError(error.response?.data?.error || "Failed to load more messages");
    } finally {
      setIsLoadingMore(false);
      userInitiatedLoadRef.current = false; // Reset user initiated flag
    }
  }, [chatId, currentPage, hasMore, isLoadingMore]);

  // Wrapper function for user-initiated loads
  const userInitiatedLoadMore = useCallback(() => {
    userInitiatedLoadRef.current = true;
    loadMoreMessages();
  }, [loadMoreMessages]);

  return { 
    messages, 
    isLoading, 
    isLoadingMore,
    isError, 
    currentChatUser,
    setMessages,
    setCurrentChatUser,
    loadMoreMessages: userInitiatedLoadMore, // Use the user-initiated version
    hasMore
  };
}

// "use client";
// import { useEffect, useState, useCallback, useRef } from "react";
// import axios from "axios";
// import { ChatUser, Message } from "@/lib/types/chat";

// export default function useFetchChat({chatId, setChatSidebarOpen}: {chatId: string, setChatSidebarOpen: (open: boolean) => void}) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);
//   const [isError, setIsError] = useState<string | null>(null);
//   const [currentChatUser, setCurrentChatUser] = useState<ChatUser>({} as ChatUser);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [totalPages, setTotalPages] = useState(1);
//   const isInitialLoadComplete = useRef(false);
//   // Add a timeout ref to prevent immediate second fetch
//   const initialLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Initial load of messages
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (chatId === "") return;
      
//       setChatSidebarOpen(true);
//       setIsLoading(true);
//       setCurrentPage(1); // Reset to page 1 when chat changes
//       isInitialLoadComplete.current = false;
      
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=10&page=1&ticketId=${chatId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
        
//         setMessages(response.data.chat.data.chats || []);
//         setCurrentChatUser(response.data.userDetails);
//         setTotalPages(response.data.chat.data.totalPages || 1);
//         setHasMore(response.data.chat.data.totalPages > 1);
//         setIsError(null);
        
//         // Set initialLoadComplete after a short delay
//         // This allows time for the chat to render and scroll to bottom
//         if (initialLoadTimeoutRef.current) {
//           clearTimeout(initialLoadTimeoutRef.current);
//         }
        
//         initialLoadTimeoutRef.current = setTimeout(() => {
//           isInitialLoadComplete.current = true;
//           initialLoadTimeoutRef.current = null;
//         }, 500); // reduced to 500ms for quicker response
        
//       } catch (error: any) {
//         console.error("Error fetching messages:", error);
//         setIsError(error.response?.data?.error || "Failed to load messages");
//         isInitialLoadComplete.current = true;
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchMessages();
    
//     // Clean up timeout on unmount
//     return () => {
//       if (initialLoadTimeoutRef.current) {
//         clearTimeout(initialLoadTimeoutRef.current);
//       }
//     };
//   }, [chatId, setChatSidebarOpen]);

//   // Function to load more messages (older messages)
//   const loadMoreMessages = useCallback(async () => {
//     // Don't load more if already loading or no chat ID
//     if (isLoadingMore || chatId === "") return;
    
//     // Make sure we have more pages to load and initial load is complete
//     if (!hasMore || !isInitialLoadComplete.current) return;
    
//     const nextPage = currentPage + 1;
    
//     setIsLoadingMore(true);
    
//     try {
//       console.log(`Loading more messages: page ${nextPage}`);
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=10&page=${nextPage}&ticketId=${chatId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
      
//       // Get older messages
//       const olderMessages = response.data.chat.data.chats || [];
      
//       if (olderMessages.length === 0) {
//         // No more messages to load
//         setHasMore(false);
//       } else {
//         // Prepend older messages to the beginning of the array
//         setMessages(prevMessages => [...olderMessages, ...prevMessages]);
        
//         // Update pagination state
//         setCurrentPage(nextPage);
//         setHasMore(nextPage < response.data.chat.data.totalPages);
//       }
      
//     } catch (error: any) {
//       console.error("Error fetching more messages:", error);
//       setIsError(error.response?.data?.error || "Failed to load more messages");
//     } finally {
//       setIsLoadingMore(false);
//     }
//   }, [chatId, currentPage, hasMore, isLoadingMore]);

//   return { 
//     messages, 
//     isLoading, 
//     isLoadingMore,
//     isError, 
//     currentChatUser,
//     setMessages,
//     setCurrentChatUser,
//     loadMoreMessages,
//     hasMore
//   };
// }