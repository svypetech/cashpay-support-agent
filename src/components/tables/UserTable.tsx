"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"

import UserProfileSidebar from "../users/UserInfoSidebar"
import Image from "next/image"
import ColourfulBlock from "../ui/ColourfulBlock"

interface User {
  id: string
  name: string
  email: string
  joinedDate: string
  status: string
  profile: string
}

interface Props {
  headings: string[]
  data: User[]
}

const UserTable: React.FC<Props> = ({ data, headings }) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [showUserSidebar, setShowUserSidebar] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])


  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown !== null) {
        const target = event.target as HTMLElement
        if (!target.closest(".dropdown-container")) {
          setActiveDropdown(null)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  useEffect(() => {
    // Adjust dropdown position for the last few rows
    if (activeDropdown !== null && tableRef.current && dropdownRefs.current[activeDropdown]) {
      const tableRect = tableRef.current.getBoundingClientRect()
      const dropdownRect = dropdownRefs.current[activeDropdown]!.getBoundingClientRect()
      const rowElement = dropdownRefs.current[activeDropdown]!.closest("tr")
      const rowRect = rowElement?.getBoundingClientRect()

      if (rowRect && dropdownRect) {
        const spaceBelow = tableRect.bottom - rowRect.bottom
        const dropdownHeight = dropdownRect.height

        // If there's not enough space below, open the dropdown upwards
        if (spaceBelow < dropdownHeight) {
          dropdownRefs.current[activeDropdown]!.style.bottom = "100%"
          dropdownRefs.current[activeDropdown]!.style.top = "auto"
          dropdownRefs.current[activeDropdown]!.style.marginBottom = "8px"
          dropdownRefs.current[activeDropdown]!.style.marginTop = "0"
        } else {
          // Otherwise, open downwards (default)
          dropdownRefs.current[activeDropdown]!.style.top = "100%"
          dropdownRefs.current[activeDropdown]!.style.bottom = "auto"
          dropdownRefs.current[activeDropdown]!.style.marginTop = "8px"
          dropdownRefs.current[activeDropdown]!.style.marginBottom = "0"
        }
      }
    }
  }, [activeDropdown])

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserSidebar(true)
    setActiveDropdown(null)
  }

  const handleSuspendUser = (user: User) => {
    console.log("Suspend user:", user)
    setActiveDropdown(null)
  }

  const handleBanUser = (user: User) => {
    console.log("Ban user:", user)
    setActiveDropdown(null)
  }

  return (
    <div className="flex-1 rounded-lg w-full   py-5">
      {/* Table */}
      <div className="rounded-lg overflow-x-auto w-full" ref={tableRef}>
        <table className="w-full text-left table-auto min-w-[700px]">
        <thead className="bg-secondary/10">
  <tr className="font-satoshi text-[12px] sm:text-[16px] whitespace-nowrap">
    <th className="p-2 sm:p-6 text-left font-[700] w-[15%]">
      {headings[0]}
    </th>
    <th className="p-2 sm:p-6 text-left font-[700] w-[15%]">
      {headings[1]}
    </th>
    <th className="p-2 sm:p-6 text-left font-[700] w-[20%]">
      {headings[2]}
    </th>
    <th className="p-2 sm:p-6 text-left font-[700] w-[20%]">
      {headings[3]}
    </th>
    <th className="p-2 sm:p-6 text-left font-[700] w-[20%]">
      {headings[4]}
    </th>
    <th className="p-2 sm:p-6 text-left font-[700] w-[10%]">
      {headings[5]}
    </th>
  </tr>
</thead>
          <tbody>
            {Array.isArray(data) &&
              data.map((user, index) => (
                <tr key={index} className="border-b border-gray-200 text-[12px] sm:text-[16px]">
                  <td className="p-2 sm:p-6 font-satoshi min-w-[100px] break-words whitespace-nowrap">{user.id}</td>
                  <td className="p-2 sm:p-6 font-satoshi font-bold text-primary min-w-[120px] break-words">
                    {user.name}
                  </td>
                  <td className="p-2 sm:p-6 font-satoshi min-w-[150px] break-words">{user.email}</td>
                  <td className="p-2 sm:p-6 font-satoshi min-w-[100px]">{user.joinedDate}</td>
                  <td className="p-2 sm:p-6 font-satoshi min-w-[120px] py-[20px]">
                   
                     
                    <ColourfulBlock
                      text={user.status}
                      className={`text-left px-4 py-2 rounded-xl  md:text-md font-semibold whitespace-nowrap ${
                        user.status === "Verified" ? "bg-[#71FB5533] text-[#20C000]" : "text-[#727272] bg-[#72727233]"
                      }`}
                     

                    />
                  </td>
                  <td className="relative p-2 sm:p-6 font-satoshi min-w-[60px] text-center">
                    <div className="dropdown-container relative">
                      <button
                        className="absolute right-0 md:relative md:right-auto cursor-pointer"
                        onClick={() => toggleDropdown(index)}
                      >
                        <Image
                          src="/icons/options.svg"
                          alt="Options"
                          width={24}
                          height={24}
                          className="w-4 h-4"
                        />
                      </button>

                      {activeDropdown === index && (
                        <div
                          className="absolute z-10  right-0 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-100"
                          ref={(el) => {
                            dropdownRefs.current[index] = el;
                          }}
                        >
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
      {selectedUser && selectedUser.status === "Verified" && (
        <UserProfileSidebar
          showSidebar={showUserSidebar}
          onClose={() => setShowUserSidebar(false)}
          user={{
            id: selectedUser.id,
            profileImage: selectedUser.profile || "/images/user-avatar.png",
            name: selectedUser.name,
            email: selectedUser.email,
            joiningDate: selectedUser.joinedDate,
            status: selectedUser.status,
          }}
        />
      )}

      {selectedUser && selectedUser.status === "Pending" && (
        <UserProfileSidebar
          showSidebar={showUserSidebar}
          onClose={() => setShowUserSidebar(false)}
          user={{
            id: selectedUser.id,
            profileImage: selectedUser.profile || "/images/user-avatar.png",
            name: selectedUser.name,
            email: selectedUser.email,
            joiningDate: selectedUser.joinedDate,
            status: selectedUser.status,
          }}
        />
      )}
    </div>
  )
}

export default UserTable