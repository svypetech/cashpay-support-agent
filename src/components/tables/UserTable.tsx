"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useDarkMode } from "@/components/providers/DarkModeProvider"
// import UserProfileSidebar from "../users/UserInfoSidebar"
import Image from "next/image"

interface User {
  ticketId: string
  userId: string
  
  issueType: string
  priority: string
  status: string
  dateCreated: string
  chat: string

}

interface Props {
  headings: string[]
  data: User[]
  onChatClick?: (supportRequest: any) => void
}

const UserTable: React.FC<Props> = ({ data, headings, onChatClick }) => {
  const { darkMode } = useDarkMode() // Get dark mode state
  const [showDark, setShowDark] = useState(darkMode)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [showUserSidebar, setShowUserSidebar] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Delay state update slightly to enable smooth transition
    const timeout = setTimeout(() => setShowDark(darkMode), 100)
    return () => clearTimeout(timeout)
  }, [darkMode])

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

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-[#EFE40833] text-[#B0A700]"
      case "Medium":
        return "bg-[#EFE40833] text-[#B0A700]"
      case "Low":
        return "bg-[#EFE40833] text-[#B0A700]"
      default:
        return ""
    }
  }
  const getStatusColors = (status: string) => {
    switch(status){
      case "Resolved":
        return "bg-[#71FB5533] text-[#20C000]"
      
      
    }
  }

  return (
    <div className="flex-1 rounded-lg w-full py-5">
      {/* Table */}
      <div className="rounded-lg overflow-x-auto w-full" ref={tableRef}>
        <table className="w-full text-left table-auto min-w-[600px]">
          <thead className="bg-[#27AAE11A]">
            <tr className=" text-[12px] sm:text-[16px] p-2 sm:p-4">
              {headings.map((heading, index) => (
                <th key={index} className="p-2 sm:p-4 text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) &&
              data.map((supportRequest, index) => (
                <tr key={index} className="border-b-[0.5px] border-black/10 text-[12px] sm:text-[16px]">
                  <td className="p-2 sm:p-4  min-w-[100px] break-words font-[400] text-[#333333]">{supportRequest.ticketId}</td>
                  <td className="p-2 sm:p-4  font-bold  min-w-[120px] break-words font-[400]">
                    {supportRequest.userId}
                  </td>
                  <td className="p-2 sm:p-4  min-w-[150px] break-words font-[400] text-[#333333]">{supportRequest.issueType}</td>
                  <td className={` min-w-[100px] text-[#333333] p-7 relative left-[-15px]`}>
                    <span className={`${getPriorityColors(supportRequest.priority)} font-[700] rounded-[12px] px-[24px] py-[12px] w-[100px] h-[38px]`}>
                    {supportRequest.priority}
                    </span>
                    </td>
                  <td className={` min-w-[100px] text-[#333333] p-7 relative left-[-15px]`}>
                    <span className={`${getStatusColors(supportRequest.status)} font-[600] rounded-[12px] px-[24px] py-[12px] w-[100px] h-[38px]`}>
                    {supportRequest.status}
                    </span>
                    </td>
                  {/* Add dateCreated column */}
                  <td className="p-2 sm:p-4  min-w-[120px] break-words font-[400] text-[#333333]">{supportRequest.dateCreated}</td>
                  {/* Add chat column */}
                  <td className="p-2 sm:p-4  min-w-[100px] break-words">
                    <button 
                      className="underline text-primary font-[400] cursor-pointer"
                      onClick={() => onChatClick && onChatClick(supportRequest)}
                    >
                      {supportRequest.chat}
                    </button>
                  </td>
                  <td className="relative p-2 sm:p-4  min-w-[60px] text-center">
                    <div className="dropdown-container relative">
                      <button
                        className="absolute right-0 md:relative md:right-auto cursor-pointer"
                        onClick={() => toggleDropdown(index)}
                      >
                        {/* Replace with three horizontal dots */}
                        <Image src="/icons/options.svg" alt="Dropdown" width={24} height={24} className="h-5 w-5 text-primary" />
                      </button>

                      {activeDropdown === index && (
                        <div
                          className="absolute z-10 right-0 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-100"
                          ref={(el) => {
                            dropdownRefs.current[index] = el;
                          }}
                        >
                          {/* ...existing dropdown content... */}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      </div>
  )}
  export default UserTable


         {/* User Profile Sidebar */}
      {/* {selectedUser && selectedsupportRequest.status === "Verified" && (
        <UserProfileSidebar
          showSidebar={showUserSidebar}
          onClose={() => setShowUserSidebar(false)}
          user={{
            id: selectedsupportRequest.id,
            profileImage: selectedsupportRequest.profile || "/images/user-avatar.png",
            name: selectedsupportRequest.name,
            issueType: selectedsupportRequest.issueType,
            joiningDate: selectedsupportRequest.priority,
            status: selectedsupportRequest.status,
          }}
        />
      )}

      {selectedUser && selectedsupportRequest.status === "Pending" && (
        <UserProfileSidebar
          showSidebar={showUserSidebar}
          onClose={() => setShowUserSidebar(false)}
          user={{
            id: selectedsupportRequest.id,
            profileImage: selectedsupportRequest.profile || "/images/user-avatar.png",
            name: selectedsupportRequest.name,
            issueType: selectedsupportRequest.issueType,
            joiningDate: selectedsupportRequest.priority,
            status: selectedsupportRequest.status,
          }}
        />
      )}
    </div>
  )
}  


*/}



