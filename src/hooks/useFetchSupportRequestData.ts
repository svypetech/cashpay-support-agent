import { useState, useEffect } from "react";
import axios from "axios";

export default function useSupportRequestData({
  currentPage,
  sortBy,
  searchQuery,
}: {
  currentPage: number;
  sortBy?: string;
  searchQuery?: string;
}) {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<
    string | undefined
  >("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}help/support-request/requestsAssignedToYou?page=${currentPage}&limit=10`;
      if (searchQuery !== "") {
        url += `&search=${debouncedSearchQuery}`;
      }
      if (sortBy !== "") {
        url += `&sortBy=${sortBy}`;
      }
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setData(response.data.requests.requests);
        setTotalPages(response.data.requests.totalPages);
      } catch (error) {
        setIsError(true);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentPage,debouncedSearchQuery,sortBy]);

  return { requests: data, totalPages, isLoading, isError,setRequests: setData};
}
