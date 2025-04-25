"use client";
import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import MainSection from "@/components/monitoring/MainSection";
import SystemHealthSection from "@/components/monitoring/SystemHealthSection";
import AlertsSection from "@/components/monitoring/AlertsSection";

export default function Monitoring() {
  const [activeTab, setActiveTab] = useState("API Logs");
  const tabs = ["API Logs", "System Health", "Alerts"];
  
  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "API Logs":
        return <MainSection />;
      case "System Health":
        return <SystemHealthSection />;
      case "Alerts":
        return <AlertsSection />;
      default:
        return <MainSection />;
    }
  };
  
  return (
    <div className="flex flex-col gap-4 relative p-3 md:px-[50px]">
      <div className="flex items-center justify-center">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} size="normal" />
      </div>
      
      {renderContent()}
    </div>
  );
}
