import { Message } from '@/lib/types/Chat';
import { format, startOfDay } from 'date-fns';

interface MessageGroup {
  date: string;
  messages: Message[];
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  // Create a map to group messages by date
  const groups: Map<string, Message[]> = new Map();

  messages.forEach(message => {
    try {
      // Get the date part only, without time
      const messageDate = new Date(message.date);
      const dateKey = startOfDay(messageDate).toISOString();
      
      // Store with original date for display formatting later
      const existingMessages = groups.get(dateKey) || [];
      groups.set(dateKey, [...existingMessages, message]);
    } catch (error) {
      console.error('Error parsing message date:', error, message);
    }
  });

  // Convert map to array and sort by date
  return Array.from(groups.entries())
    .map(([dateKey, messages]) => ({
      date: dateKey,
      messages: messages.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '/icons/pdf.svg';
  if (fileType.includes('image')) return '/icons/image.svg';
  if (fileType.includes('doc') || fileType.includes('word')) return '/icons/doc.svg';
  return '/icons/file.svg';
};

export const formatFileSize = (size: number): string => {
  return `${Math.round(size / 1024)} KB`;
};



export  const formatMessageTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format as 12-hour time with AM/PM
      return format(date, 'h:mm a'); // Example: "2:45 PM"
    } catch (error) {
      console.error("Time formatting error:", error);
      return '';
    }
  };