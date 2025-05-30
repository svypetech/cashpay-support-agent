"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router
import { Bell, Menu } from "lucide-react";
import { Admin } from "@/lib/types/User"; // Import Admin type

export default function Navbar() {
  const router = useRouter(); // Initialize router
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({} as Admin);
  const [image, setImage] = useState("");
  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setImage(JSON.parse(storedUser).image);
    }
  }, []);

  // Centralized logout function
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    router.push("/signin"); // Programmatically navigate
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center">
        <Image
          src={"/images/logo.svg"}
          alt="logo"
          height={34}
          width={152}
        />
      </Link>

      <div className="flex items-center gap-4 md:hidden">
        {/* <button
          aria-label="Notifications"
          className="relative p-1 rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-500" />
        </button> */}

        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={image ? image : "/images/user-avatar.png"}
              alt="Profile picture"
              width={32}
              height={32}
              className="bg-amber-500"
            />
          </div>
          <span className="text-sm font-medium"></span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary ml-2 cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <Menu className="h-5 w-5 text-primary ml-2 cursor-pointer" />
            )}
          </button>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="hidden md:flex items-center gap-2 sm:gap-6">
        {/* <button
          aria-label="Notifications"
          className="relative p-1 rounded-full hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-500" />
        </button> */}

        <div className="relative bg-gray-100 rounded-xl py-2 px-4 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`relative h-8 w-8 rounded-full overflow-hidden ${image != "" ? "" : "bg-gray-200 animate-pulse"}`}>
              {image != "" ? (
              <Image
                src={image ? image : "/images/user-avatar.png"}
                alt="Profile picture"
                width={32}
                height={32}
                
              />
              ) : null 
            }
            </div>
            <span className="text-sm font-medium">{user.name}</span>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary ml-2 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <Menu className="h-5 w-5 text-primary ml-2 cursor-pointer" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="absolute top-10 right-0 w-44 bg-white rounded-md shadow-lg py-3 px-4 z-10 border border-gray-100 font-[satoshi]">
              <div className="space-y-3">
                <Link
                  onClick={() => setIsMenuOpen(false)}
                  href="/settings"
                  className="block text-sm text-secondary font-bold cursor-pointer"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-sm text-[#DF1D1D] font-bold cursor-pointer w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User dropdown menu */}
      {isMenuOpen && (
        <div className="absolute top-14 right-4 w-40 bg-white rounded-md shadow-lg py-3 px-4 z-10 border border-gray-100 md:hidden">
          <div className="space-y-3 font-[satoshi]">
            <Link
              onClick={() => setIsMenuOpen(false)}
              href="/settings"
              className="block text-sm text-secondary font-bold cursor-pointer"
            >
              Forgot Password
            </Link>
            <button
              onClick={handleLogout}
              className="block text-sm text-[#DF1D1D] font-bold cursor-pointer w-full text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
