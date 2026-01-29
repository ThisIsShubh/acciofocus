'use client';
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

export default function Chat({ roomId, user, onParticipantsUpdate }) {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const hasJoined = useRef(false);

    useEffect(() => {
        if (onParticipantsUpdate) {
            onParticipantsUpdate(participants);
        }
    }, [participants, onParticipantsUpdate]);

    const isInitializing = useRef(false);

    useEffect(() => {
        // Init Check: User needed? (optional, but good for auth). RoomId DEFINITELY needed.
        if (!user || !roomId) {
            console.log("Chat: Waiting for user/roomId...", { user: !!user, roomId });
            return;
        }

        // Guard: One-time initialization per valid session
        if (socket) return;
        if (isInitializing.current) return;
        isInitializing.current = true;

        const socketInitializer = async () => {
            try {
                // This triggers the API route to start the Socket.io server if needed
                await fetch('/api/socket/io');
            } catch (e) {
                console.error('Socket init request failed', e);
            }

            const newSocket = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
                reconnectionAttempts: 5,
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            newSocket.on('server-debug-info', (data) => {
                console.log('socket connected with server:', data);
                console.log('Current Room ID:', roomId); // This closes over current roomId
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket');
                // Join immediately on connect
                newSocket.emit('join-room', {
                    roomId, // Uses the roomId from closure (guaranteed not null by check above)
                    user: {
                        id: user.id || 'anon',
                        name: user.name || 'Anonymous',
                        avatar: user.avatar
                    }
                });
            });

            newSocket.on('message-history', (history) => {
                console.log('CLIENT: Received history:', history);
                setMessages(history);
            });

            newSocket.on('receive-message', (message) => {
                console.log('CLIENT: Received message:', message);
                setMessages((prev) => [...prev, message]);

                // Auto scroll
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            });

            newSocket.on('update-participants', (users) => {
                console.log('SOCKET: Received update-participants:', users);
                setParticipants(users);
                if (onParticipantsUpdate) onParticipantsUpdate(users);
            });

            setSocket(newSocket);
        };

        socketInitializer();

        return () => {
            // Optional: Disconnect on unmount? 
            // setSocket(null); isInitializing.current = false;
        };
    }, [roomId, user]); // Re-run if these change (e.g. from null to value)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const messageData = {
            roomId,
            message: input,
            user: {
                name: user?.name || 'Anonymous',
                avatar: user?.avatar,
            },
            timestamp: new Date().toISOString(),
        };

        console.log("CLIENT: Sending message:", messageData);
        socket.emit('send-message', messageData);
        // We don't optimistic update here to avoid duplication if server echoes back, 
        // OR we can optimistic update and filter duplicates. 
        // Simpler: Strict Socket.io pattern -> emit, server broadcasts to all including sender.
        // But for better latency feeling:
        setMessages((prev) => [...prev, messageData]);
        setInput('');
    };

    // Deduping identical messages (crude protection against strict mode double-renders or echo)
    // Actually, simply relying on unique IDs is better, but for now we'll trust the flow.

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Connection Status */}
            {!socket && (
                <div className="bg-yellow-50 text-yellow-700 text-xs px-4 py-1 flex items-center justify-center">
                    Connecting to chat...
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                {messages.length === 0 && socket && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Say hello! 👋
                    </div>
                )}

                {messages.map((msg, idx) => {
                    if (msg.system) {
                        return (
                            <div key={idx} className="flex justify-center my-4">
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium">
                                    {msg.text}
                                </span>
                            </div>
                        )
                    }
                    const isMe = msg.user?.name === user?.name;
                    return (
                        <div key={idx} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm border ${isMe ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    {msg.user?.avatar ? <img src={msg.user.avatar} alt="avatar" className="w-full h-full object-cover" /> : (msg.user?.name?.[0] || '?')}
                                </div>
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-[10px] text-gray-400 ml-1 mb-0.5">{msg.user?.name}</span>}
                                <div className={`px-4 py-2 shadow-sm relative text-sm ${isMe
                                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'
                                    }`}>
                                    {msg.message}
                                    <div className={`text-[9px] mt-1 flex justify-end opacity-70 ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={socket ? "Type a message..." : "Connecting..."}
                    disabled={!socket}
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !socket}
                    className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                    <FaPaperPlane size={14} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
}
