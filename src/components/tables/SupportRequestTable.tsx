"use client";

import type React from "react";
import { useRef, useState } from "react";
import Image from "next/image";

import ColourfulBlock from "../ui/ColourfulBlock";
import ConfirmModal from "../ui/ConfirmModal"; // Import the confirmation modal
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
  // Add state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [requestToResolve, setRequestToResolve] = useState<string | null>(null);

  // Handle icon click to show confirmation modal
  const handleResolveClick = (requestId: string, status: string) => {
    // if (status.toLowerCase() === "resolved") return;
    setRequestToResolve(requestId);
    setShowConfirmModal(true);
  };

  // Handle confirmation
  const handleConfirmResolve = async () => {
    if (!requestToResolve) return;

    await markResolved(requestToResolve);
    setShowConfirmModal(false);
    setRequestToResolve(null);
  };

  const markResolved = async (requestId: string) => {
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
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmResolve}
        title="Resolve Request"
        message="Are you sure you want to mark this request as resolved?"
      />

      {/* Table */}
      <div className="rounded-lg overflow-x-auto w-full" ref={tableRef}>
        <table className="w-full text-left table-auto min-w-[1000px]">
          <thead className="bg-secondary/10">
            <tr className="text-[12px] sm:text-[16px]">
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[12%] whitespace-nowrap">
                {headings[0]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[10%]">
                {headings[1]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[17%]">
                {headings[2]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[15%]">
                {headings[3]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[15%]">
                {headings[4]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[18%] whitespace-nowrap">
                {headings[5]}
              </th>
              <th className="py-4 px-4 text-left font-[700] text-[16px] w-[12%] whitespace-nowrap">
                {headings[6]}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(supportRequests) &&
              supportRequests.map((supportRequest, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 text-[12px] sm:text-[16px]"
                >
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[100px] break-words font-[400] text-[#333333]">
                    {shortenAddress(supportRequest._id)}
                  </td>
                  
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[120px] break-words font-[400] whitespace-nowrap">
                    {shortenAddress(supportRequest.userId)}
                  </td>
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[150px] break-words font-[400] text-[#333333] whitespace-nowrap">
                    {supportRequest.issueType}
                  </td>

                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[100px] text-[#333333]">
                    <ColourfulBlock
                      className={`${getStatusColors(
                        supportRequest.status.toLowerCase()
                      )} md:text-md`}
                      text={supportRequest.status}
                    />
                  </td>
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[120px] break-words font-[400] text-[#333333] whitespace-nowrap">
                    {formatDate(supportRequest.updateDate)}
                  </td>
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[100px] text-left whitespace-nowrap">
                    <button
                      className="underline text-primary font-[400] cursor-pointer flex justify-start"
                      onClick={() => onChatClick && onChatClick(supportRequest)}
                    >
                      {`chat.cashpay/${shortenAddress(supportRequest._id)}`}
                    </button>
                  </td>

                  {/* Replace checkbox with SVG icon */}
                  <td className="py-3 px-2 sm:px-4 sm:py-4 min-w-[60px] text-center">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() =>
                          handleResolveClick(
                            supportRequest._id,
                            supportRequest.status
                          )
                        }
                        // disabled={supportRequest.status.toLowerCase() === "resolved"}
                        className={`p-1 rounded-full opacity-100 ${
                          supportRequest.status.toLowerCase() === "resolved"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100 cursor-pointer"
                        }`}
                      >
                        <Image
                          src="/icons/support_options.svg"
                          alt="Resolve Request"
                          width={24}
                          height={24}
                          className={
                            supportRequest.status.toLowerCase() === "resolved"
                              ? "opacity-50"
                              : ""
                          }
                        />
                      </button>
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
