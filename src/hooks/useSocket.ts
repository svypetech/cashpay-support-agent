"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useToast } from "@/components/Providers/ToastProvider";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || '';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const recentlySentRef = useRef<boolean>(false);
    const { showError } = useToast();
    
    useEffect(() => {
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
        
        socket.on('connect', () => {
            setIsConnected(true);
        });
        
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        
        socket.on('connect_error', (error) => {
            setIsConnected(false);
            showError("Connection Error", `Failed to connect to server: ${error.message}`);
        });

        // Listen for general socket errors
        socket.on('error', (error) => {
            showError("Socket Error", error.message || "An unexpected error occurred");
        });

        // Listen for file upload errors
        socket.on('fileUploadError', (error) => {
            showError("File Upload Failed", error.message || "Failed to upload file");
        });

        // Listen for message send errors
        socket.on('messageError', (error) => {
            showError("Message Send Failed", error.message || "Failed to send message");
        });

        // Listen for authentication errors
        socket.on('authError', (error) => {
            showError("Authentication Error", error.message || "Authentication failed");
        });

        // Listen for general server errors
        socket.on('serverError', (error) => {
            showError("Server Error", error.message || "Server error occurred");
        });
        
        return () => {
            socket.disconnect();
        };
    }, [showError]);
    
    // 📤 SEND MESSAGE (Text only)
    const sendMessage = useCallback((message: string, ticketId: string) => {
        if (!socketRef.current || !isConnected) {
            return Promise.resolve({ success: false, tempId: null });
        }
        
        return new Promise<{ success: boolean, tempId: string | null }>((resolve) => {
            try {
                const tempId = `temp-${Date.now()}`;
                
                recentlySentRef.current = true;
                
                socketRef.current!.emit('message', {
                    message,
                    ticketId,
                    authorization: `Bearer ${localStorage.getItem("token")}`
                });
                
                setTimeout(() => {
                    recentlySentRef.current = false;
                }, 10000);
                
                resolve({ success: true, tempId });
            } catch (error) {
                resolve({ success: false, tempId: null });
            }
        });
    }, [isConnected]);

    // 📎 SEND FILE with optional message
    const sendFile = useCallback((file: File, message: string, ticketId: string) => {
        if (!socketRef.current || !isConnected) {
            showError("Connection Error", "Unable to send file. Please check your connection.");
            return Promise.resolve({ success: false, tempId: null });
        }
        
        return new Promise<{ success: boolean, tempId: string | null }>((resolve) => {
            try {
                const tempId = `temp-${Date.now()}`;
                
                // Convert file to ArrayBuffer using FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    if (!arrayBuffer) {
                        showError("Upload Error", "Failed to read file");
                        resolve({ success: false, tempId: null });
                        return;
                    }

                    // Convert ArrayBuffer to Buffer (Node.js style buffer that Socket.IO can handle)
                    const buffer = Buffer.from(arrayBuffer);

                    // First argument: file metadata + message + ticketId
                    const fileMetadata = {
                        image: {
                            fieldname: "file",
                            originalname: file.name,
                            encoding: "7bit",
                            mimetype: file.type,
                            size: file.size
                        },
                        // Send message in the same format as server expects
                        message: message.trim() ? `${file.name}\n${message.trim()}` : file.name,
                        ticketId: ticketId
                    };

                    recentlySentRef.current = true;
                    
                    console.log('Sending file buffer:', {
                        metadata: fileMetadata,
                        bufferLength: buffer.length,
                        bufferType: typeof buffer,
                        isBuffer: Buffer.isBuffer(buffer),
                        bufferPreview: buffer.slice(0, 16).toString('hex') // Show first 16 bytes as hex
                    });
                    
                    // Emit with both arguments - send actual buffer
                    socketRef.current!.emit('handleFile', fileMetadata, buffer);
                    
                    setTimeout(() => {
                        recentlySentRef.current = false;
                    }, 10000);
                    
                    resolve({ success: true, tempId });
                };
                
                reader.onerror = () => {
                    showError("Upload Error", "Failed to read file");
                    resolve({ success: false, tempId: null });
                };
                
                // Read file as ArrayBuffer to get binary data
                reader.readAsArrayBuffer(file);
            } catch (error) {
                showError("Upload Error", "Failed to send file");
                resolve({ success: false, tempId: null });
            }
        });
    }, [isConnected, showError]);
    
    // 📨 LISTEN FOR NEW MESSAGES
    const onNewMessage = useCallback((callback: (messages: any[], isRefetch: boolean) => void) => {
        if (!socketRef.current) return () => {};
        
        socketRef.current.on('ticketChat', (...args) => {
            console.log('ticketChat event received:', args);
            
            // Handle the server response format you provided
            const serverResponse = args[0];
            
            if (serverResponse && serverResponse.success && serverResponse.data && serverResponse.data.chats) {
                // This is the server confirmation response with chats array
                const chats = serverResponse.data.chats;
                if (chats.length > 0) {
                    // Check if this is a new message or a refetch
                    // If recentlySentRef is true, this might be our own message confirmation
                    if (recentlySentRef.current) {
                        // This is likely our own message confirmation
                        const latestMessage = chats[0];
                        console.log('Processing own message confirmation:', latestMessage._id);
                        callback([latestMessage], false);
                    } else {
                        // This might be messages from others or initial load
                        // Process all new messages that we haven't seen
                        console.log('Processing messages from others or initial load:', chats.length, 'messages');
                        callback(chats, true); // Mark as refetch to handle properly in Chat component
                    }
                }
            } else {
                // Handle direct message format (single message)
                const latestMessage = args[args.length - 1];
                
                if (latestMessage && latestMessage._id && (latestMessage.message || latestMessage.image)) {
                    console.log('Processing direct message:', latestMessage._id);
                    callback([latestMessage], false);
                } else {
                    // Fallback: look for any valid message in args
                    const validMessage = args.find(arg => 
                        arg && arg._id && (arg.message || arg.image) && arg.ticketId
                    );
                    
                    if (validMessage) {
                        console.log('Processing fallback message:', validMessage._id);
                        callback([validMessage], false);
                    }
                }
            }
        });
        
        // Listen for direct message events (for real-time messages from others)
        socketRef.current.on('message', (messageData) => {
            console.log('Direct message event received:', messageData);
            if (messageData && messageData._id) {
                callback([messageData], false);
            }
        });

        // Listen for file upload success responses
        socketRef.current.on('fileUploaded', (fileData) => {
            console.log('File uploaded event received:', fileData);
            if (fileData && fileData._id) {
                callback([fileData], false);
            }
        });

        // Listen for new incoming messages from other users
        socketRef.current.on('newMessage', (messageData) => {
            console.log('New message from other user:', messageData);
            if (messageData && messageData._id) {
                callback([messageData], false);
            }
        });

        // Listen for new file messages from other users
        socketRef.current.on('newFileMessage', (fileData) => {
            console.log('New file message from other user:', fileData);
            if (fileData && fileData._id) {
                callback([fileData], false);
            }
        });
        
        return () => {
            socketRef.current?.off('ticketChat');
            socketRef.current?.off('message');
            socketRef.current?.off('fileUploaded');
            socketRef.current?.off('newMessage');
            socketRef.current?.off('newFileMessage');
        };
    }, []);
    
    return { 
        socket: socketRef.current, 
        sendMessage,
        sendFile,
        onNewMessage,
        isConnected 
    };
};