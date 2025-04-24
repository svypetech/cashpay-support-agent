export interface Message {
    id: string;
    content: string;
    timestamp: string;
    sender: 'user' | 'agent';
    attachment?: {
      name: string;
      size: string;
      type: string;
      url: string;
    };
  }
  
  export interface ChatUser {
    name: string;
    email: string;
    avatar?: string;
  }


  