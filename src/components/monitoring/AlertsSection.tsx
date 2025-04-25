"use client";

import { useState } from "react";
import Image from "next/image";
import Tabs from "@/components/ui/Tabs";
import Pagination from "@/components/tables/pagination/pagination";
import Search from "@/components/ui/Search";
import Sort from "../ui/Sort";

interface AlertRule {
  ruleId: string;
  ruleName: string;
  metric: string;
  threshold: string;
  duration: string;
  notification: string;
  recipient: string;
}

export default function AlertsSection() {
  const [activeTab, setActiveTab] = useState("Rules");
  const tabs = ["Rules", "History"];
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data based on the image
  const alertsData = [
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
    {
      ruleId: "AR-001",
      ruleName: "High CPU Usage",
      metric: "CPU Usage",
      threshold: "> 90%",
      duration: "10 minutes",
      notification: "Email, In-App",
      recipient: "DevOps Team",
    },
  ];

  const tableHeadings = [
    "Rule ID", 
    "Rule Name", 
    "Metric", 
    "Threshold", 
    "Duration", 
    "Notification", 
    "Recipient", 
    "Actions"
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Filter data implementation would go here
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          size="small"
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-2">
        <div className="sm:w-[60%]">
          <Search onSearch={handleSearch} className="" />
        </div>
        
        <div className="flex gap-4 items-center sm:w-[40%] w-full">
          <Sort title="Sort by" className="sm:w-[60%] w-[50%]" />
          
          <button className="sm:w-[40%] w-[50%] bg-primary text-white font-medium md:my-1 py-2 px-4 rounded-lg hover:bg-primary/90">
            Add Rule
          </button>
        </div>
      </div>
      
      <AlertsTable headings={tableHeadings} data={alertsData} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// AlertsTable component
function AlertsTable({ headings, data }: { headings: string[], data: AlertRule[] }) {
  return (
    <div className="flex-1 rounded-lg w-full py-5">
      <div className="rounded-lg overflow-x-auto">
        <table className="w-full text-left table-auto min-w-[1000px]">
          <thead className="bg-secondary/10">
            <tr>
              {headings.map((heading, index) => (
                <th key={index} className="p-4 text-left font-[700]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((rule, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-4">{rule.ruleId}</td>
                <td className="p-4">{rule.ruleName}</td>
                <td className="p-4">{rule.metric}</td>
                <td className="p-4">{rule.threshold}</td>
                <td className="p-4">{rule.duration}</td>
                <td className="p-4">{rule.notification}</td>
                <td className="p-4">{rule.recipient}</td>
                <td className="p-4 text-center">
                  <button className="cursor-pointer">
                    <Image src="/icons/edit.svg" alt="Edit" width={24} height={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}