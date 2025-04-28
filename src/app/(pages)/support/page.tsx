"use client";
import { lazy, Suspense, useState } from "react";

// dynamic import for both components
import Tabs from "@/components/ui/Tabs";
const ChatsPage = lazy(() => import("@/components/support/chat/ChatsPage"));
import MainSection from "@/components/support/support-requests/SupportRequest";


export default function Support() {
  const [activeTab, setActiveTab] = useState("Support Requests");
  const tabs = ["Support Requests", "Chats"];
  
  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Chats":
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ChatsPage />
          </Suspense>
        )
        
        
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
