import { useState, useEffect } from "react";
import axios from "axios";

export default function useUser({
  currentPage,
  limit,
  sortBy = "",
  filterStatus = "",
}: {
  currentPage: number;
  limit: number;
  sortBy?: string;
  filterStatus?: string;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}user/all?page=${currentPage}&limit=${limit}&sortBy=${sortBy}`;
        if (sortBy === "") {
          url = `${process.env.NEXT_PUBLIC_BACKEND_URL}user/all?page=${currentPage}&limit=${limit}`;
        }
        if (filterStatus) {
          url += `&filterStatus=${filterStatus}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUsers(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        setIsError(true);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, sortBy, filterStatus]);

  return { users, totalPages, isLoading, isError, setUsers };
}
