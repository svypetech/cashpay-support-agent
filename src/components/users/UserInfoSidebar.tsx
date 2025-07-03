"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import VerificationAccordion from "./VerificationAccordion";
import axios from "axios";
import { User } from "@/lib/types/User";
import UserSidebarSkeleton from "../skeletons/SidebarSkeleton";
import useFetchKycUser from "@/hooks/getKycUser";
import { isCompleteKycUser, isNewKycUser } from "@/lib/types/KycUser";

interface UserProfileSidebarProps {
  showSidebar: boolean;
  onClose: () => void;
  user: User | null;
  setData: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserProfileSidebar({
  showSidebar,
  onClose,
  user,
  setData,
}: UserProfileSidebarProps) {
  // ✅ Single state for visibility and animation
  const [isVisible, setIsVisible] = useState(false);
  const [shouldSlideIn, setShouldSlideIn] = useState(false);
  
  const { user: kycUser, isLoading: isKycLoading, isError } = useFetchKycUser(user?._id || "");

  // Prevent body scrolling when sidebar is open
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSidebar]);

  // ✅ Fixed animation logic
  useEffect(() => {
    if (showSidebar) {
      setIsVisible(true); // Show the component
      setTimeout(() => {
        setShouldSlideIn(true); // Trigger slide-in animation
      }, 50); // Small delay to ensure DOM is ready
    } else {
      setShouldSlideIn(false); // Start slide-out animation
      const timer = setTimeout(() => {
        setIsVisible(false); // Hide the component after animation
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [showSidebar]);

  // ✅ Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // ✅ Show skeleton while KYC data is loading
  if (isKycLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            shouldSlideIn ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            shouldSlideIn ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <UserSidebarSkeleton
            showSidebar={true}
            onClose={onClose}
            shouldSlideIn={shouldSlideIn}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* ✅ Backdrop with proper opacity transition */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          shouldSlideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ✅ Sidebar with proper slide transition */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          shouldSlideIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 mt-5">
            <h2 className="text-2xl font-semibold">User Profile</h2>
            <button
              onClick={onClose}
              className="rounded-full cursor-pointer p-1 hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col items-center px-6 py-8 font-[satoshi] w-full">
            {/* Profile Image */}
            <div className="mb-4 h-32 w-32 overflow-hidden rounded-full">
              <img
                src={user?.selfieUrl || "/images/blank-profile.webp"}
                alt={"user avatar"}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* User Info */}
            <h3 className="mb-1 text-xl font-semibold">
              {user?.name
                ? user?.name.firstName + " " + user?.name.lastName
                : "N/A"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">User ID: {user?._id}</p>
            
            <div className="flex flex-col justify-center mb-6">
              <div className="mb-2 flex w-full items-center">
                <div className="flex w-full gap-5">
                  <div className="flex gap-2 w-24">
                    <Image
                      src="/icons/sms.svg"
                      alt="User Icon"
                      width={25}
                      height={25}
                      className="h-5 w-5 text-gray-400"
                    />
                    <span className="font-bold">Email</span>
                  </div>
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className="mb-2 flex w-full items-center">
                <div className="flex w-full gap-5">
                  <div className="flex gap-2 w-24">
                    <Image
                      src="/icons/calendar.svg"
                      alt="User Icon"
                      width={25}
                      height={25}
                      className="h-5 w-5 text-gray-400"
                    />
                    <span className="font-bold">Joining</span>
                  </div>
                  <span className="text-sm">{user?.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              {/* KYC Verification */}
              <div
                className={`mb-4 flex w-full items-center justify-between gap-10 ${
                  kycUser?.status !== "approved" ? "mb-10" : ""
                }`}
              >
                <h4 className="text-2xl font-semibold text-center">
                  KYC Verification
                </h4>
                {kycUser?.status === "approved" ? (
                  <span className="rounded-xl font-bold px-4 py-2 text bg-[#71FB5533] text-[#20C000]">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-xl font-bold px-4 py-2 text-[#727272] bg-[#72727233]">
                    Pending
                  </span>
                )}
              </div>
              
              {/* Verification Badge */}
              {kycUser &&
                isCompleteKycUser(kycUser) &&
                kycUser?.status === "approved" && (
                  <div className="mb-12 flex justify-center">
                    <div className="relative">
                      <Image
                        src="/icons/blue-clock.svg"
                        alt="Verification Badge"
                        width={220}
                        height={220}
                        className="w-full h-full"
                      />
                      <Image
                        src="/icons/ellipse-shadow.svg"
                        alt="Verification Badge"
                        width={162}
                        height={12}
                        className="absolute top-27 w-full h-full"
                      />
                    </div>
                  </div>
                )}
                
              {kycUser &&
                isCompleteKycUser(kycUser) &&
                kycUser?.status === "requested" && (
                  <div className="w-full pb-8">
                    <VerificationAccordion kycUser={kycUser} />
                  </div>
                )}
                
              {kycUser && isNewKycUser(kycUser) && (
                <div className="w-full pb-8">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">
                      KYC Not Applied
                    </h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      This user has not applied for KYC verification yet. They
                      will need to complete the KYC process to verify their
                      identity.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
