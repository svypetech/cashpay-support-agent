export interface Message {
  _id: string;
  isRead: boolean;
  isReplied: boolean;
  sender: string;
  senderType: string;
  ticketId: string;
  message: string;
  date: string;
  __v?: number;
  showStatus?: boolean; // New property to control status display
}

export interface ChatUser {
    userName: {
      firstName: string;
      lastName: string;
    };
    userImage: string;
    avatar?: string;
    name?:string;
    email?:string
  };

  export interface ChatPreview {
  ticketId: string; 
  date: string; 
  message: string; 
  image: string | null; 
  userName: {
    firstName: string;
    lastName: string;
  } | null; 
  userImage: string | null; 
}