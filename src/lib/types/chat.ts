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

