"use client";
import { useState } from "react";
import Tabs from "@/components/support-requests/Tabs";
import MainSection from "@/components/support-requests/MainSection";
import ChatsPage from "@/components/chat/ChatsPage";

export default function Support() {
  const [activeTab, setActiveTab] = useState("Support Requests");
  const tabs = ["Support Requests", "Chats", "Users"];
  
  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Chats":
        return <ChatsPage />;
      case "Users":
        return <div>Users Page Content</div>; // Placeholder for Users tab
      case "Support Requests":
      default:
        return <MainSection />;
    }
  };
  
  return (
    <div className="flex flex-col gap-4 relative p-3 sm:px-10">
      <div className="flex items-center justify-center gap-4">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} size="normal" />
      </div>
      
      {renderContent()}
    </div>
  );
}
