

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";

    // Format the date as YYYY-MM-DD HH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    return "Error";
  }
};



export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "-";

  if (address.length <= chars * 2 + 2) return address;

  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const AuthenticateUser = () => {
  
  let user = null;
  let token = localStorage.getItem("token");
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (error) {
    return;
  }
  if (
    !token ||
    !user ||
    !(typeof user === "object") ||
    Object.keys(user).length === 0
  ) {
    return false;
  }
  else{
    return true;
  }
};

import { Message } from "@/lib/types/chat";

export function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  if (!messages || !messages.length) return [];

  // Sort messages by date (oldest first)
  const sortedMessages = [...messages].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const groups: { [key: string]: Message[] } = {};

  // Group messages by date
  sortedMessages.forEach(message => {
    // Get date part only (YYYY-MM-DD)
    const date = new Date(message.date).toISOString().split('T')[0];
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(message);
  });

  // Convert object to array format, sorted by date (oldest to newest)
  return Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(date => ({
      date,
      messages: groups[date]
    }));
}

// Format message time (HH:MM AM/PM)
export function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return '';
  }
}