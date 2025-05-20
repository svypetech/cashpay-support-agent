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

export const sampleMessages: Message[] = [
  // Today's messages
  {
    _id: "msg1",
    message: "Hi there! I'm having an issue with my last transaction. It shows as pending for over 48 hours now.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat1",
    date: new Date().toISOString(),
    sender: "John Doe",
    __v: 0
  },
  {
    _id: "msg2",
    message: "Hello John, I'd be happy to help you with that. Could you please provide your transaction ID?",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat1",
    date: new Date().toISOString(),
    sender: "Support Agent",
    __v: 0
  },
  {
    _id: "msg3",
    message: "Sure, it's TX78945612. Thanks for the quick response!",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat1",
    date: new Date().toISOString(),
    sender: "John Doe",
    __v: 0
  },
  {
    _id: "msg4",
    message: "Thanks, will get back to you shortly after checking the status.",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat1",
    date: new Date().toISOString(),
    sender: "Support Agent",
    __v: 0
  },
  
  // Yesterday's messages - chat2
  {
    _id: "msg5",
    message: "I'm having an issue with my account verification. The system keeps rejecting my documents.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat2",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    sender: "Sarah Smith",
    __v: 0
  },
  {
    _id: "msg6",
    message: "I'm sorry to hear that, Sarah. What type of documents have you tried uploading?",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat2",
    date: new Date(Date.now() - 86200000).toISOString(), // Almost 1 day ago
    sender: "Support Agent",
    __v: 0
  },
  {
    _id: "msg7",
    message: "I've tried my driver's license and passport, but neither worked.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat2",
    date: new Date(Date.now() - 86000000).toISOString(), // Almost 1 day ago
    sender: "Sarah Smith",
    __v: 0
  },
  
  // 2 days ago - chat3
  {
    _id: "msg8",
    message: "When will my transaction be processed? It's been pending for a week now.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat3",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    sender: "Michael Johnson",
    __v: 0
  },
  {
    _id: "msg9",
    message: "Hello Michael. I apologize for the delay. Let me check the status right away.",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat3",
    date: new Date(Date.now() - 170800000).toISOString(), // Almost 2 days ago
    sender: "Support Agent",
    __v: 0
  },
  {
    _id: "msg10",
    message: "I've reviewed your transaction and it appears there was a verification hold. I've cleared it now and your transaction should complete within the next hour.",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat3",
    date: new Date(Date.now() - 168800000).toISOString(), // Almost 2 days ago
    sender: "Support Agent",
    __v: 0
  },
  
  // 3 days ago - chat4
  {
    _id: "msg11",
    message: "I need help resetting my 2FA. I got a new phone and can't access my account.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat4",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    sender: "Emily Wilson",
    __v: 0
  },
  {
    _id: "msg12",
    message: "Hello Emily, I'd be happy to help you with resetting your 2FA. For security verification, could you please confirm your email address and the last 4 digits of your phone number?",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat4",
    date: new Date(Date.now() - 258200000).toISOString(), // Almost 3 days ago
    sender: "Support Agent",
    __v: 0
  },
  {
    _id: "msg13",
    message: "My email is emily.wilson@example.com and last 4 digits are 5678.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat4",
    date: new Date(Date.now() - 257200000).toISOString(), // Almost 3 days ago
    sender: "Emily Wilson",
    __v: 0
  },
  {
    _id: "msg14",
    message: "Thank you for verifying that. I've sent a reset link to your email. Please follow the instructions to reset your 2FA.",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat4",
    date: new Date(Date.now() - 256200000).toISOString(), // Almost 3 days ago
    sender: "Support Agent",
    __v: 0
  },
  {
    _id: "msg15",
    message: "Thank you for your help!",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat4",
    date: new Date(Date.now() - 255200000).toISOString(), // Almost 3 days ago
    sender: "Emily Wilson",
    __v: 0
  },
  
  // 4 days ago - chat5
  {
    _id: "msg16",
    message: "How do I update my payment method? I want to add a new card.",
    isRead: true,
    isReplied: false,
    senderType: "user",
    ticketId: "chat5",
    date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    sender: "David Brown",
    __v: 0
  },
  {
    _id: "msg17",
    message: "Hello David, you can update your payment method by going to Settings > Payment Methods > Add New Payment Method. If you have any trouble, please let me know.",
    isRead: true,
    isReplied: true,
    senderType: "admin",
    ticketId: "chat5",
    date: new Date(Date.now() - 344600000).toISOString(), // Almost 4 days ago
    sender: "Support Agent",
    __v: 0
  }
];

