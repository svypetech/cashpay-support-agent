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
            // Don't ignore completely, but handle differently when we just sent a message
            if (data && data.success && data.data && data.data.chats && data.data.chats.length > 0) {
                // Extract just the newest message if we recently sent a message
                if (recentlySentRef.current) {
                    console.log('Processing ticketChat carefully after sending message');
                    
                    // Find the last message in the array (should be our just-sent message)
                    const newestMessage = data.data.chats[data.data.chats.length - 1];
                    
                    // Only pass the newest message, not the whole chat history
                    if (newestMessage) {
                        callback([newestMessage], false); // Process as a single message, not refetch
                    }
                } else {
                    // Normal processing for regular updates
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