"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || '';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    // Keep track of recently sent messages to avoid duplicates
    const recentMsgRef = useRef<Map<string, string>>(new Map()); 
    // Add flag to track recent message sends
    const recentlySentRef = useRef<boolean>(false);
    
    useEffect(() => {
        // Create socket connection
        const socket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem("token")
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });
        
        socketRef.current = socket;
        
        // Set up event listeners
        socket.on('connect', () => {
            console.log('Socket.IO Connected');
            setIsConnected(true);
        });
        
        socket.on('disconnect', () => {
            console.log('Socket.IO Disconnected');
            setIsConnected(false);
        });
        
        socket.on('connect_error', (error) => {
            console.error('Socket.IO Connection Error:', error);
            setIsConnected(false);
        });
        
        // Clean up on unmount
        return () => {
            socket.disconnect();
        };
    }, []);
    
    // Function to send messages via socket
    const sendMessage = useCallback((message: string, ticketId: string) => {
        if (!socketRef.current || !isConnected) {
            console.error("Socket not connected");
            return Promise.resolve({ success: false, tempId: null });
        }
        
        return new Promise<{ success: boolean, tempId: string | null }>((resolve) => {
            try {
                // Create a temporary ID for this message
                const tempId = `temp-${Date.now()}`;
                
                // Mark that we just sent a message - this helps prevent auto-fetching
                recentlySentRef.current = true;
                
                // Send message
                socketRef.current!.emit('message', {
                    message,
                    ticketId,
                    authorization: `Bearer ${localStorage.getItem("token")}`
                });
                
                // Reset the recently sent flag after a short delay
                setTimeout(() => {
                    recentlySentRef.current = false;
                }, 2000);
                
                // Consider message sent successfully if socket is connected
                resolve({ success: true, tempId });
            } catch (error) {
                console.error("Error emitting message:", error);
                resolve({ success: false, tempId: null });
            }
        });
    }, [isConnected]);
    
    // Function to listen for new messages and ticket updates
    const onNewMessage = useCallback((callback: (messages: any[], isRefetch: boolean) => void) => {
        if (!socketRef.current) return () => {};
        
        // Listen for ticketChat events which contain chat history updates
        socketRef.current.on('ticketChat', (data) => {
            if (data && data.success && data.data && data.data.chats && data.data.chats.length > 0) {
                console.log(`Received ticketChat with ${data.data.chats.length} messages`);
                
                // If we just sent a message, this is likely a message confirmation - don't replace entire history
                if (recentlySentRef.current) {
                    console.log('Processing ticketChat as single message (sent recently)');
                    
                    // Just extract the newest message that's likely our just-sent message
                    const newestMessage = data.data.chats[data.data.chats.length - 1];
                    if (newestMessage) {
                        callback([newestMessage], false); // Process as single message, not refetch
                    }
                } 
                // Otherwise, check if this is a partial update with only new messages
                else if (data.data.chats.length < 5) {
                    console.log('Small batch of messages - likely new messages only');
                    callback(data.data.chats, false); // Process as new individual messages
                }
                // For full chat refreshes, properly mark as refetch
                else {
                    console.log('Full chat history refresh');
                    callback(data.data.chats, true);
                }
            }
        });
        
        // Listen for direct new_message events
        socketRef.current.on('new_message', (newMessage) => {
            if (newMessage) {
                callback([newMessage], false);
            }
        });
        
        // Return cleanup function
        return () => {
            socketRef.current?.off('ticketChat');
            socketRef.current?.off('new_message');
        };
    }, []);
    
    return { 
        socket: socketRef.current, 
        sendMessage,
        onNewMessage,
        isConnected 
    };
};

// "use client";

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || '';

// export const useSocket = () => {
//     const [isConnected, setIsConnected] = useState(false);
//     const socketRef = useRef<Socket | null>(null);
//     // Keep track of recently sent messages to avoid duplicates
//     const recentMsgRef = useRef<Map<string, string>>(new Map()); // Store temp ID -> real ID mapping
    
//     useEffect(() => {
//         // Create socket connection
//         const socket = io(SOCKET_URL, {
//             auth: {
//                 token: localStorage.getItem("token")
//             },
//             transports: ['websocket', 'polling'],
//             reconnection: true,
//             reconnectionAttempts: Infinity,
//             reconnectionDelay: 1000,
//         });
        
//         socketRef.current = socket;
        
//         // Set up event listeners
//         socket.on('connect', () => {
//             console.log('Socket.IO Connected');
//             setIsConnected(true);
//         });
        
//         socket.on('disconnect', () => {
//             console.log('Socket.IO Disconnected');
//             setIsConnected(false);
//         });
        
//         socket.on('connect_error', (error) => {
//             console.error('Socket.IO Connection Error:', error);
//             setIsConnected(false);
//         });
        
//         // Clean up on unmount
//         return () => {
//             socket.disconnect();
//         };
//     }, []);
    
//     // Function to send messages via socket
//     const sendMessage = useCallback((message: string, ticketId: string) => {
//         if (!socketRef.current || !isConnected) {
//             console.error("Socket not connected");
//             return Promise.resolve({ success: false, tempId: null });
//         }
        
//         return new Promise<{ success: boolean, tempId: string | null }>((resolve) => {
//             try {
//                 // Create a temporary ID for this message
//                 const tempId = `temp-${Date.now()}`;
                
//                 // Send message
//                 socketRef.current!.emit('message', {
//                     message,
//                     ticketId,
//                     authorization: `Bearer ${localStorage.getItem("token")}`
//                 });
                
//                 // Consider message sent successfully if socket is connected
//                 resolve({ success: true, tempId });
//             } catch (error) {
//                 console.error("Error emitting message:", error);
//                 resolve({ success: false, tempId: null });
//             }
//         });
//     }, [isConnected]);
    
//     // Function to listen for new messages and ticket updates
//     const onNewMessage = useCallback((callback: (messages: any[], isRefetch: boolean) => void) => {
//         if (!socketRef.current) return () => {};
        
//         // Listen for ticketChat events which contain chat history updates
//         socketRef.current.on('ticketChat', (data) => {
//             if (data && data.success && data.data && data.data.chats && data.data.chats.length > 0) {
//                 // Pass all new messages to the callback
//                 callback(data.data.chats, true);
//             }
//         });
        
//         // Listen for direct new_message events
//         socketRef.current.on('new_message', (newMessage) => {
//             if (newMessage) {
//                 callback([newMessage], false);
//             }
//         });
        
//         // Return cleanup function
//         return () => {
//             socketRef.current?.off('ticketChat');
//             socketRef.current?.off('new_message');
//         };
//     }, []);
    
//     return { 
//         socket: socketRef.current, 
//         sendMessage,
//         onNewMessage,
//         isConnected 
//     };
// };