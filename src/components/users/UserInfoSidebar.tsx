"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import VerificationSteps from "./VerficationStatus";
import VerificationAccordion from "./VerificationForm";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { User } from "@/lib/types/User";

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
  const [isVisible, setIsVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const steps = [
    { title: "Personal Details", completed: user?.KycProfileAdded || false },
    { title: "Documents", completed: user?.KycIdDocAdded || false },
    { title: "Selfie", completed: user?.KycSellfieAdded || false },
  ];

  const handleStartVerification = () => {
    console.log("Starting verification process");
    setVerificationStarted(true);
  };

  const handleVerifyUser = async () => {
    setIsVerifying(true);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}user/updateKycStatus`,
        {
          status: "Approved",
          id: user && user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsVerifying(false);
      setData((prevUsers) =>
        prevUsers.map((prevUser) =>
          prevUser._id === (user && user._id)
            ? { ...prevUser, verificationStatus: "Approved" }
            : prevUser
        )
      );
      alert("User verification status updated successfully.");
    } catch (error) {
    } finally {
      onClose();
      setVerificationStarted(false);
    }
  };

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

  useEffect(() => {
    if (showSidebar) {
      setIsVisible(true);
      setTimeout(() => {
        setSlideIn(true);
      }, 10);
    } else {
      setSlideIn(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showSidebar]);

  if (!showSidebar && !isVisible && !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          slideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          slideIn ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {verificationStarted ? (
          <div className="flex flex-col h-full justify-between pb-5">
            <div className="flex h-full flex-col overflow-y-auto">
              {/* Header - Centered */}
              <div className="flex items-center justify-between px-6 py-4 mt-5">
                <div></div>
                <button
                  onClick={() => {
                    onClose();
                    setVerificationStarted(false);
                  }}
                  className="rounded-full cursor-pointer p-1 hover:bg-gray-100"
                  aria-label="Close sidebar"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Content - Centered */}
              <div className="flex flex-col items-center px-6 py-8 font-[satoshi] mx-auto max-w-[420px]">
                <div className="mb-4 flex w-full items-center justify-between gap-5 px-5">
                  <h4 className="text-2xl font-semibold text-center">
                    KYC Verification
                  </h4>
                  <span className="rounded-xl font-bold px-4 py-2 text-[#727272] bg-[#72727233]">
                    Pending
                  </span>
                </div>
                <VerificationAccordion
                  personalDetails={{
                    name:
                      (user &&
                        user.name.firstName + " " + user.name.lastName) ||
                      "",
                    dob: (user && user.DOB) || "",
                    region: (user && user.region) || "",
                  }}
                  document={{
                    url: (user && user.idDocUrl) || "",
                    fileName:
                      (user &&
                        user.name.firstName +
                          " " +
                          user.name.lastName +
                          " ID.png") ||
                      "",
                  }}
                  selfieDocument={{
                    url: (user && user.selfieUrl) || "",
                    fileName:
                      (user &&
                        user.name.firstName +
                          " " +
                          user.name.lastName +
                          " selfie.png") ||
                      "",
                  }}
                />
              </div>
            </div>
            {/* Button - Centered */}
            <div className="px-6 flex justify-center">
              <button
                onClick={handleVerifyUser}
                disabled={isVerifying}
                className="w-full max-w-[320px] cursor-pointer rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-900 disabled:opacity-70"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Please Wait...</span>
                  </div>
                ) : (
                  "Verify User"
                )}
              </button>
            </div>
          </div>
        ) : (
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
            {/* Content - All containers centered */}
            <div className="flex flex-col items-center px-6 py-8 font-[satoshi] mx-auto max-w-[420px] w-full">
              {/* Profile Image - Centered */}
              <div className="mb-4 h-32 w-32 overflow-hidden rounded-full flex items-center justify-center">
                <img
                  src={
                    (user && user.selfieUrl) ||
                    "/placeholder.svg?height=200&width=200"
                  }
                  alt={
                    (user &&
                      user.name &&
                      user.name.firstName + " " + user.name.lastName) ||
                    "User Profile"
                  }
                  className="h-full w-full object-cover"
                />
              </div>
              {/* User Info - Centered */}
              <div className="text-center w-full mb-6">
                <h3 className="mb-1 text-xl font-semibold">
                  {(user &&
                    user.name &&
                    user.name.firstName + " " + user.name.lastName) ||
                    "User Profile"}
                </h3>
                <p className="text-sm text-gray-500">
                  User ID: {(user && user._id) || "N/A"}
                </p>
              </div>

              {/* User Details - Centered */}
              <div className="flex flex-col justify-center mb-6 w-full min-w-[400px] px-10">
                <div className="mb-2 flex w-full items-center">
                  <div className="flex w-full gap-1 w-full">
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
                    <span className="">{(user && user.email) || "N/A"}</span>{" "}
                    <br />
                  </div>
                </div>
                <div className="mb-2 flex w-full items-center">
                  <div className="flex w-full gap-1">
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
                    <span className="text-sm">
                      {(user && user.date) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Verification Section - Centered */}
              <div className="flex flex-col justify-center w-full max-w-[380px]">
                {/* KYC Header - Centered */}
                <div className="mb-4 flex w-full items-center justify-between gap-5 ">
                  <h4 className="text-2xl font-semibold text-center">
                    KYC Verification
                  </h4>
                  {user &&
                    user.verificationStatus.toLowerCase() === "approved" && (
                      <span className="rounded-xl font-bold px-4 py-2 text bg-[#71FB5533] text-[#20C000]">
                        Verified
                      </span>
                    )}
                  {user && user.verificationStatus === "Pending" && (
                    <span className="rounded-xl font-bold px-4 py-2 text-[#727272] bg-[#72727233]">
                      Pending
                    </span>
                  )}
                </div>

                {/* Verification Badge - Centered */}
                {user && user.verificationStatus === "Approved" && (
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

                {/* Verification Steps - Centered */}
                {user && user.verificationStatus === "Pending" && (
                  <div className="w-full flex justify-center">
                    <VerificationSteps
                      steps={steps}
                      onStartVerification={handleStartVerification}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
