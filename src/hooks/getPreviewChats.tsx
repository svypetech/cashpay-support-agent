"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ChatPreview } from "@/lib/types/chat";

interface ChatPreviewsResponse {
  success: boolean;
  data: ChatPreview[];
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
}

interface UseChatPreviewsParams {
  limit?: number;
  page?: number;
  isRead?: boolean;
  isReplied?: boolean;  
  search?: string;
  autoFetch?: boolean;
}

export default function useChatPreviews({
  limit = 20,
  page = 1,
  isRead,
  isReplied,
  search = "",
  autoFetch = true
}: UseChatPreviewsParams = {}) {
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Build query parameters for backend API
  const buildQueryParams = useCallback((pageNum: number) => {
    const params = new URLSearchParams();
    
    params.append('limit', limit.toString());
    params.append('page', pageNum.toString());
    
    // ✅ Add isRead parameter to backend URL
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }
    
    // ✅ Add isReplied parameter to backend URL
    if (isReplied !== undefined) {
      params.append('isReplied', isReplied.toString());
    }
    
    // ✅ Add search parameter to backend URL
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    console.log(`🔗 Backend API URL params:`, params.toString());
    return params.toString();
  }, [limit, isRead, isReplied, search]);

  // 📚 INITIAL FETCH - Load first page
  const fetchChatPreviews = useCallback(async (resetData = true, showLoadingSkeleton = true) => {
    // ✅ Show loading skeleton when filters change or initial load
    if (showLoadingSkeleton) {
      setIsLoading(true);
    }
    setIsError(null);
    
    try {
      console.log(`📚 Fetching chat previews - page 1, limit: ${limit}`, {
        isRead,
        isReplied,
        search: search || 'none'
      });
      const queryParams = buildQueryParams(1);
      const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/yourChats?${queryParams}`;
      
      console.log(`📚 Backend API URL:`, backendUrl);
      
      const response = await axios.get<ChatPreviewsResponse>(backendUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log(`📚 API: Fetched ${response.data.data.length} chat previews`);
      
      if (resetData) {
        setChatPreviews(response.data.data);
      } else {
        setChatPreviews(prev => [...prev, ...response.data.data]);
      }
      
      setTotalPages(response.data.totalPages || Math.ceil((response.data.totalCount || response.data.data.length) / limit));
      setTotalCount(response.data.totalCount || response.data.data.length);
      setCurrentPage(1);
      
      // ✅ Better hasMore logic
      const totalPagesCalculated = response.data.totalPages || Math.ceil((response.data.totalCount || response.data.data.length) / limit);
      setHasMore(totalPagesCalculated > 1);
      
    } catch (error: any) {
      console.error("❌ Error fetching chat previews:", error);
      setIsError(error.response?.data?.message || "Failed to load chat previews");
      if (resetData) {
        setChatPreviews([]);
      }
    } finally {
      if (showLoadingSkeleton) {
        setIsLoading(false);
      }
    }
  }, [buildQueryParams, limit, isRead, isReplied, search]);

  // 📚 LOAD MORE - For infinite scroll
  const loadMoreChatPreviews = useCallback(async () => {
    if (isLoadingMore || !hasMore || currentPage >= totalPages) {
      console.log(`📚 Load more skipped:`, {
        isLoadingMore,
        hasMore,
        currentPage,
        totalPages
      });
      return;
    }
    
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      console.log(`📚 Loading more chat previews - page ${nextPage}, limit: ${limit}`);
      const queryParams = buildQueryParams(nextPage);
      const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/yourChats?${queryParams}`;
      
      console.log(`📚 Backend API URL (page ${nextPage}):`, backendUrl);
      
      const response = await axios.get<ChatPreviewsResponse>(backendUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log(`📚 API: Fetched ${response.data.data.length} more chat previews`);
      
      if (response.data.data.length > 0) {
        setChatPreviews(prev => {
          // Remove duplicates based on ticketId
          const existingIds = new Set(prev.map(chat => chat.ticketId));
          const newChats = response.data.data.filter(chat => !existingIds.has(chat.ticketId));
          
          console.log(`📚 Adding ${newChats.length} new chats`);
          return [...prev, ...newChats];
        });
        
        setCurrentPage(nextPage);
        setHasMore(nextPage < totalPages);
      } else {
        console.log(`📚 No more chats to load`);
        setHasMore(false);
      }
      
    } catch (error: any) {
      console.error("❌ Error loading more chat previews:", error);
      setIsError(error.response?.data?.message || "Failed to load more chat previews");
    } finally {
      setIsLoadingMore(false);
    }
  }, [buildQueryParams, currentPage, totalPages, hasMore, isLoadingMore, limit]);

  // 🔄 REFRESH - Reset and fetch from beginning
  const refreshChatPreviews = useCallback(() => {
    console.log(`🔄 Refreshing chat previews`);
    setCurrentPage(1);
    setHasMore(true);
    fetchChatPreviews(true, true); // ✅ Show loading skeleton on refresh
  }, [fetchChatPreviews]);

  // ✅ Auto-fetch when filter parameters change - ALWAYS show loading skeleton
  useEffect(() => {
    if (autoFetch) {
      console.log(`🔄 Auto-fetching due to parameter change:`, {
        isRead,
        isReplied,
        search: search || 'none'
      });
      // ✅ Reset pagination state when filters change
      setCurrentPage(1);
      setHasMore(true);
      // ✅ ALWAYS show loading skeleton when filters change
      fetchChatPreviews(true, true);
    }
  }, [isRead, isReplied, search, autoFetch, fetchChatPreviews]);

  return {
    // Data
    chatPreviews,
    totalCount,
    totalPages,
    currentPage,
    
    // Loading states
    isLoading,
    isLoadingMore,
    isError,
    hasMore,
    
    // Actions
    fetchChatPreviews,
    loadMoreChatPreviews,
    refreshChatPreviews,
    
    // State setters (if you need manual control)
    setChatPreviews,
    setIsError,
  };
}

// 🎯 USAGE EXAMPLES:

// Basic usage - fetch all chats
// const { chatPreviews, isLoading, loadMoreChatPreviews, hasMore } = useChatPreviews();

// Fetch unread chats only
// const { chatPreviews, isLoading } = useChatPreviews({ isRead: false });

// Fetch unreplied chats with search
// const { chatPreviews, isLoading } = useChatPreviews({ 
//   isReplied: false, 
//   search: 'Sharm' 
// });

// Custom limit and manual fetch
// const { chatPreviews, isLoading, fetchChatPreviews } = useChatPreviews({ 
//   limit: 20, 
//   autoFetch: false 
// });