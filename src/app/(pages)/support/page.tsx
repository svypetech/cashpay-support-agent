"use client";
import { useState } from "react";

// dynamic import for both components
import Tabs from "@/components/ui/Tabs";
import ChatsPage from "@/components/support/chat/ChatsPage";
import SupportRequests from "@/components/support/support-requests/SupportRequest";
import UsersComponent from "@/components/users/UsersComponent";

export default function Support() {
  const [activeTab, setActiveTab] = useState("Support Requests");
  const tabs = ["Support Requests", "Chats", "Users"];

  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "Chats":
        return <ChatsPage />;
      case "Support Requests":
        return <SupportRequests />;

      case "Users":
        return <UsersComponent />;

      default:
        return <SupportRequests />;
    }
  };

  return (
    <div className="flex flex-col gap-4 relative px-6 sm:px-10">
      <div className="flex items-center justify-center gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          size="normal"
        />
      </div>

      {renderContent()}
    </div>
  );
}
