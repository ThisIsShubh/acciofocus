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

    useEffect(() => {
        const socketInitializer = async () => {
            // Only initialize if user is loaded (to avoid sending "Anonymous" initially)
            if (!user) return;

            try {
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

            newSocket.on('connect', () => {
                console.log('Connected to socket');
                // Only join if we haven't already or if we reconnected
                if (!hasJoined.current || newSocket.recovered) {
                    newSocket.emit('join-room', {
                        roomId,
                        user: {
                            id: user.id || 'anon',
                            name: user.name || 'Anonymous',
                            avatar: user.avatar
                        }
                    });
                    hasJoined.current = true;
                }
            });

            newSocket.on('receive-message', (data) => {
                setMessages((prev) => [...prev, data]);
            });

            newSocket.on('update-participants', (users) => {
                console.log("SOCKET: Received update-participants:", users);
                setParticipants(users);
            });

            setSocket(newSocket);
        };

        if (user) {
            socketInitializer();
        }

        return () => {
            if (socket) socket.disconnect();
            hasJoined.current = false;
        };
    }, [roomId, user]); // Re-run if user matches (e.g. loads late)

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
            {/* Header - Green Theme */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 text-white">
                <h3 className="font-bold flex items-center gap-2">
                    Room Chat
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                        {participants.length} Online
                    </span>
                </h3>
            </div>

            {/* Participant List (Mini) */}
            {participants.length > 0 && (
                <div className="bg-emerald-50 px-4 py-2 flex gap-2 overflow-x-auto border-b border-emerald-100 no-scrollbar">
                    {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-emerald-100 shadow-sm flex-shrink-0">
                            <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] text-emerald-800 font-bold overflow-hidden">
                                {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" /> : p.name[0]}
                            </div>
                            <span className="text-xs text-emerald-900 truncate max-w-[80px]">{p.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-96">
                {messages.map((msg, idx) => {
                    if (msg.system) {
                        return (
                            <div key={idx} className="text-center text-xs text-gray-400 my-2 italic">
                                {msg.text}
                            </div>
                        )
                    }
                    const isMe = msg.user?.name === user?.name;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                ? 'bg-emerald-500 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {!isMe && <div className="text-xs font-bold mb-1 text-emerald-600">{msg.user?.name}</div>}
                                <p className="text-sm">{msg.message}</p>
                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={user ? "Type a message..." : "Connecting..."}
                    disabled={!user}
                    className="flex-1 px-4 py-2 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 transition-all text-sm"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !user}
                    className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <FaPaperPlane size={14} />
                </button>
            </form>
        </div>
    );
}
