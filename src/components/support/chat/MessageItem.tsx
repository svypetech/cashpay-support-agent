import Image from 'next/image';

import { Message } from '@/lib/types/chat';
import { getFileIcon } from '@/utils/chat/utils';



interface MessageItemProps {
    message: Message;
  }


export default function MessageItem({ message }: MessageItemProps) {

  return (
    <div 
      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`min-[500px]:w-[318px]  w-[258px] rounded-lg px-2 py-2 ${
        message.sender === 'agent' 
          ? 'bg-primary2 text-white' 
          : 'bg-primary7 text-gray-800'
      }`}>
        <p className="text-sm">{message.content}</p>
        
        {message.attachment && (
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
        )}
        
        <div className={`text-xs mt-1 ${
          message.sender === 'agent' ? 'text-blue-100' : 'text-gray-400'
        }`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}