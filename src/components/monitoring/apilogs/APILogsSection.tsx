import { useState } from "react";

import Search from "@/components/ui/Search";
import Sort from "@/components/ui/Sort";
import { APILogsData as Data } from "@/utils/APILogsData";
import UserTable from "@/components/tables/SupportRequestTable";
import Pagination from "@/components/tables/pagination/pagination";
import APILogsTable from "../../tables/APILogsTable";


const headings = [
    "Request ID",
    "Endpoint",
    "Timestamp",
    "Status", 
    "Error Message"
  ];

export default function MainSection() {
  const [data, setData] = useState(Data);
  const [filteredData, setFilteredData] = useState(Data);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(15);
  
  

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (value: string) => {
    const filtered = data.filter((item) =>
      item.requestID.toString().includes(value)
    );
    setFilteredData(filtered);
  };

  // Handle chat click from table
 

  // Handle sending message
  

  return (
    <div className="flex flex-col gap-4 relative">
      
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-10 mt-[20px]">
        <Search className="sm:w-[50%] w-full" onSearch={handleSearch} />
        <Sort className="sm:w-[25%] w-full" title="Filter" />
        <Sort className="sm:w-[25%] w-full" title="Filter" />

      </div>
      
      <APILogsTable 
        headings={headings} 
        data={filteredData} 
        
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      
    </div>
  );
}
