"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import ColourfulBlock from "../ui/ColourfulBlock";
import ConfirmModal from "../ui/ConfirmModal";
import { User } from "@/lib/types/User";
import ExpandableId from "../ui/ExpandableId";
import UserProfileSidebar from "../users/UserInfoSidebar";

interface Props {
  headings: string[];
  data: User[];
  setData: React.Dispatch<React.SetStateAction<User[]>>;
}

function formatDate(dateString: string): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    // Format with locale then replace slashes with hyphens
    return date
      .toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
  } catch (error) {
    return "Invalid date format";
  }
}

const UserTable: React.FC<Props> = ({ data, headings, setData }) => {
  const [success, setSuccess] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [showUserSidebar, setShowUserSidebar] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>({} as User);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Simple dropdown logic: close on outside click
  useEffect(() => {
    console.log("length: ", data.length);
    console.log("index:", selectedIndex);
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserSidebar(true);
    setActiveDropdown(null);
  };

  const needsPadding =
    activeDropdown !== null &&
    (selectedIndex >= data.length - 2 || // Last two rows
      data.length <= 2); // If there are 2 or fewer rows, always add padding

  return (
    <div className="flex-1 rounded-lg w-full py-5">
      {/* Table - Add padding bottom for dropdown space */}
      <div
        className={`rounded-lg overflow-x-auto w-full ${
          needsPadding ? "pb-24" : ""
        } `}
      >
        <table className="w-full text-left table-auto min-w-[700px]">
          <thead className="bg-secondary/10">
            <tr className="font-satoshi text-[12px] sm:text-[16px] whitespace-nowrap">
              <th className="p-2 sm:p-5 text-left font-[700] w-[12%]">
                {headings[0]}
              </th>
              <th className="p-2 sm:p-5 text-left font-[700] w-[15%]">
                {headings[1]}
              </th>
              <th className="p-2 sm:p-5 text-left font-[700] w-[23%]">
                {headings[2]}
              </th>
              <th className="p-2 sm:p-5 text-left font-[700] w-[20%]">
                {headings[3]}
              </th>
              <th className="p-2 sm:p-5 text-center font-[700] w-[10%]">
                {headings[4]}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) &&
              data.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 text-[12px] sm:text-[16px]"
                >
                  <td className="p-2 sm:p-5 font-satoshi min-w-[100px] break-words whitespace-nowrap">
                    <ExpandableId id={user._id} />
                  </td>
                  <td className="p-2 sm:p-5 font-satoshi font-bold text-primary min-w-[120px] break-words whitespace-nowrap">
                    {user.name
                      ? user.name?.firstName + " " + user.name?.lastName
                      : "N/A"}
                  </td>
                  <td className="p-2 sm:p-5 font-satoshi min-w-[150px] break-words whitespace-nowrap">
                    {user.email ? user.email : "N/A"}
                  </td>
                  <td className="p-2 sm:p-5 font-satoshi min-w-[100px] whitespace-nowrap">
                    {formatDate(user.date)}
                  </td>
                  <td className="relative p-2 sm:p-5 font-satoshi min-w-[60px] text-center">
                    <div className="dropdown-container relative inline-block">
                      {/* ✅ Centered options button with better styling */}
                      <button
                        className="relative cursor-pointer p-2 rounded-full transition-colors duration-200 flex items-center justify-center"
                        onClick={() => {
                          setSelectedIndex(index);
                          toggleDropdown(index);
                        }}
                        aria-label="Options menu"
                      >
                        <Image
                          src="/icons/options.svg"
                          alt="Options"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </button>

                      {/* ✅ Better positioned dropdown */}
                      {activeDropdown === index && (
                        <div className="absolute z-10 top-full mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-100 right-0 lg:right-auto lg:left-1/2 lg:-translate-x-1/2">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-primary font-bold cursor-pointer hover:bg-gray-50"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* User Profile Sidebar */}
      {selectedUser && (
        <UserProfileSidebar
          setData={setData}
          showSidebar={showUserSidebar}
          onClose={() => {
            setShowUserSidebar(false);
            setSelectedUser({} as User);
          }}
          user={{
            ...selectedUser,
            date: formatDate(selectedUser.date),
          }}
        />
      )}
    </div>
  );
};

export default UserTable;
