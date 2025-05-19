import Image from "next/image";

import { Message } from "@/lib/types/Chat";
import { getFileIcon } from "@/utils/chat/functions";

import { formatMessageTime } from "@/utils/chat/functions";
interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex ${
        message.sender === "agent" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`min-[500px]:w-[318px]  w-[258px] rounded-lg px-2 py-2 ${
          message.sender === "agent"
            ? "bg-primary2 text-white"
            : "bg-primary7 text-gray-800"
        }`}
      >
        <p className="text-sm">{message.message}</p>

        {/* {message.attachment && (
          <div className="mt-2 bg-white rounded-lg px-2 py-2 flex items-center justify-between text-black">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-1 rounded">
                <Image 
                  src={getFileIcon(message.attachment.type)} 
                  alt={message.attachment.type} 
                  width={20} 
                  height={20} 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins font-[400]">{message.attachment.name}</p>
                <p className="text-xs text-gray-400 font-poppins font-[400]">{message.attachment.size}</p>
              </div>
            </div>
            <a href={message.attachment.url} download className="text-primary">
              <Image src="/icons/chat-download.svg" alt="Download" width={18} height={18} />
            </a>
          </div>
        )} */}

        <div
          className={`text-xs mt-1 text-right ${
            message.sender === "agent" ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {formatMessageTime(message.date)}
        </div>
      </div>
    </div>
  );
}
