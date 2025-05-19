"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";

import ColourfulBlock from "../ui/ColourfulBlock";
import { getStatusColors } from "@/utils/GetBlockColor";
import { SupportRequest } from "@/lib/types/SupportRequest";
import { formatDate, shortenAddress } from "@/utils/functions";
import axios from "axios";

interface Props {
  headings: string[];
  supportRequests: SupportRequest[];
  onChatClick?: (supportRequest: any) => void;
  setRequests: any;
}

const SupportRequestTable = ({
  supportRequests,
  headings,
  onChatClick,
  setRequests,
}: Props) => {
  const tableRef = useRef<HTMLDivElement>(null);

  const markResolved = async (requestId: string,status: string) => {
    
    
    
    if(status.toLowerCase() === "resolved") return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}help/support-request/markResolve`,
        {
          requestId: requestId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      handleResolveChange(requestId);
    } catch (error: any) {
      alert(JSON.stringify(error.response.data.error));
    }
  };

  const handleResolveChange = (supportRequestId: string) => {
    setRequests((prev: SupportRequest[]) =>
      prev.map((request: SupportRequest) => {
        return request._id === supportRequestId
          ? { ...request, status: "Resolved" }
          : request;
      })
    );
  };

  return (
    <div className="flex-1 rounded-lg w-full py-5">
      {/* Table */}
      <div className="rounded-lg overflow-x-auto w-full" ref={tableRef}>
        <table className="w-full text-left table-auto min-w-[800px]">
          <thead className="bg-secondary/10">
            <tr className="text-[12px] sm:text-[16px]">
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[12%] whitespace-nowrap">
                {headings[0]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[10%]">
                {headings[1]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[17%]">
                {headings[2]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[15%]">
                {headings[3]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[15%]">
                {headings[4]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[18%] whitespace-nowrap">
                {headings[5]}
              </th>
              <th className="py-4 px-6 text-left font-[700] text-[16px] w-[12%] whitespace-nowrap">
                {headings[6]}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(supportRequests) &&
              supportRequests.map((supportRequest, index) => (
                <tr
                  key={index}
                  className="border-b-[0.5px] border-black/10 text-[12px] sm:text-[16px]"
                >
                  <td className="py-6 px-6 min-w-[100px] break-words font-[400] text-[#333333]">
                    {shortenAddress(supportRequest._id)}
                  </td>
                  <td className="py-6 px-6  min-w-[120px] break-words font-[400] whitespace-nowrap">
                    {shortenAddress(supportRequest.userId)}
                  </td>
                  <td className="py-6 px-6 min-w-[150px] break-words font-[400] text-[#333333] whitespace-nowrap">
                    {supportRequest.issueType}
                  </td>

                  <td className="py-6 px-6 min-w-[100px] text-[#333333]">
                    <ColourfulBlock
                      className={`${getStatusColors(
                        supportRequest.status.toLowerCase()
                      )} font-[600] rounded-[12px] py-[8px] relative left-[-12px]`}
                      text={supportRequest.status}
                    />
                  </td>
                  <td className="py-6 px-6 min-w-[120px] break-words font-[400] text-[#333333] whitespace-nowrap">
                    {formatDate(supportRequest.updateDate)}
                  </td>
                  <td className="py-6 px-6 min-w-[100px] text-left whitespace-nowrap">
                    <button
                      className="underline text-primary font-[400] cursor-pointer flex justify-start"
                      onClick={() => onChatClick && onChatClick(supportRequest)}
                    >
                      {`chat.cashpay/${shortenAddress(
                        supportRequest._id
                      )}`}
                    </button>
                  </td>

                  <td className="py-6 px-6 min-w-[60px] text-center ">
                    <div className="flex justify-center items-center">
                      <input
                        type="checkbox"
                        id={`resolve-${supportRequest._id}`}
                        checked={
                          supportRequest.status.toLowerCase() === "resolved" 
                        }
                        onChange={() => markResolved(supportRequest._id,supportRequest.status)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportRequestTable;
