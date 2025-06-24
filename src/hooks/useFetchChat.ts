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
      setCurrentPage(1);
      isInitialLoadComplete.current = false;
      
      try {
        // Increase limit to ensure we get all recent messages
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=20&page=1&ticketId=${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        // Ensure we have messages array even if empty
        const chatMessages = response.data.chat.data.chats || [];
        console.log(`Initial load: Fetched ${chatMessages.length} messages`);
        
        setMessages(chatMessages);
        setCurrentChatUser(response.data.userDetails);
        setTotalPages(response.data.chat.data.totalPages || 1);
        setHasMore(response.data.chat.data.totalPages > 1);
        setIsError(null);
        
        // Set initialization complete immediately to render UI faster
        isInitialLoadComplete.current = true;
        
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

  // Fix loadMoreMessages to preserve scroll position
  const loadMoreMessages = useCallback(async () => {
    // Skip if already loading or no more pages
    if (isLoadingMore || chatId === "" || !hasMore) return;
    
    // Save current scroll position
    const scrollContainer = document.getElementById("chat-container");
    const initialScrollHeight = scrollContainer?.scrollHeight || 0;
    const initialScrollTop = scrollContainer?.scrollTop || 0;
    
    setIsLoadingMore(true);
    console.log(`Loading more messages - page ${currentPage + 1}`);
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=20&page=${currentPage + 1}&ticketId=${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Get older messages
      const olderMessages = response.data.chat.data.chats || [];
      console.log(`Fetched ${olderMessages.length} older messages`);
      
      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        // Add messages to STATE WITHOUT REPLACING existing ones
        setMessages(prevMessages => {
          // Get unique message IDs we already have
          const existingIds = new Set(prevMessages.map(msg => msg._id));
          
          // Only add messages we don't already have - explicitly type the parameter
          const messagesToAdd = olderMessages.filter((msg: Message) => !existingIds.has(msg._id));
          
          // Create new combined array and sort by date
          const newMessages = [...messagesToAdd, ...prevMessages].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          console.log(`Added ${messagesToAdd.length} new messages, total now: ${newMessages.length}`);
          return newMessages;
        });
        
        setCurrentPage(currentPage + 1);
        
        // Restore scroll position after state update and render
        setTimeout(() => {
          if (scrollContainer) {
            const newScrollHeight = scrollContainer.scrollHeight;
            const heightDifference = newScrollHeight - initialScrollHeight;
            scrollContainer.scrollTop = initialScrollTop + heightDifference;
            console.log("Scroll position preserved after loading older messages");
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
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