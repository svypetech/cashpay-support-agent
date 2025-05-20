import { useEffect, useState } from "react";
import axios from "axios";
import { ChatUser, Message } from "@/lib/types/chat";


export default function useFetchChat({chatId, setChatSidebarOpen}: {chatId: string, setChatSidebarOpen: (open: boolean) => void}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser>({} as ChatUser);

  useEffect(() => {
    const fetchMessages = async () => {
      if (chatId === "") return;
      setChatSidebarOpen(true);
      setIsLoading(true);
      let response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}help/chat/all?limit=10&page=1&ticketId=${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessages(response.data.chat.data.chats);
      setCurrentChatUser(response.data.userDetails);
      setIsLoading(false);
    };
    try {
      fetchMessages();
    } catch (error: any) {
      alert(JSON.stringify(error.response.data.error));
    }
  }, [chatId]);

  return { messages, isLoading, isError, currentChatUser,setMessages,setCurrentChatUser };
}
