"use client";

import { useState, useMemo } from "react";
import UserTable from "../tables/UserTable";
import Pagination from "../pagination/pagination";
import Tabs from "../ui/Tabs";
import Search from "../ui/Search";
import Sort from "../ui/Sort";
import useFetchUsers from "@/hooks/useFetchUser";
import SkeletonTableLoader from "../skeletons/SkeletonTableLoader";

const headings = [
  "User ID",
  "Name",
  "E-mail",
  "Joined date",
  "Status",
  "Actions",
];

// Sort options
const sortOptions = [
  { label: "None", value: "" },
  { label: "Date", value: "date" },
  { label: "Status", value: "userStatus" },
];


export default function UsersComponent() {
  // All states in one place
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const {
    users: allUsers,
    totalPages,
    isLoading,
    isError,
    setUsers,
  } = useFetchUsers({ currentPage, limit: 10, sortBy, filterStatus });

  // Define tabs for the Tabs component
  const tabs = ["All", "Verified", "Pending Verifications"];

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Filter and sort users based on activeTab, searchQuery, and sortBy
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];

    // First filter by tab
    let filtered = allUsers;
    if (activeTab === "All") {
      setFilterStatus("");
    } else if (activeTab === "Verified") {
      setFilterStatus("Approved");
    } else if (activeTab === "Pending Verifications") {
      setFilterStatus("Pending");
    }

    
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter((user) => {
        if (!user.name) return false;
        let name = user.name.firstName + " " + user.name.lastName;
        return (
          name.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.userId?.toString().includes(search)
        );
      });
    }

    return filtered;
  }, [allUsers, activeTab, searchQuery]);

  return (
    <>
      {/* Navigation Tabs - Using Tabs component */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        size="normal"
      />

      {/* Search and Actions */}
      <div className="flex flex-col gap-4 sm:gap-[28px] sm:flex-row">
        <Search className="sm:w-[80%] w-full" onSearch={setSearchQuery} />
        <Sort
          className="sm:w-[20%] w-full"
          title="Sort"
          options={sortOptions}
          onSort={setSortBy}
        />
      </div>

      {/* Content area */}
      {isLoading ? (
        <SkeletonTableLoader
          headings={headings}
          rowCount={10}
          minWidth="1200"
        />
      ) : isError ? (
        <div className="text-red-500 py-10 text-center">
          Error loading users
        </div>
      ) : (
        <div className="mt-4">
          <UserTable
            headings={headings}
            data={filteredUsers}
            setData={setUsers}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
