'use client';
import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { FaPaperPlane } from 'react-icons/fa';

export default function Chat({ roomId, user, onParticipantsUpdate }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [participants, setParticipants] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const pusherRef = useRef(null);
    const channelRef = useRef(null);

    useEffect(() => {
        if (onParticipantsUpdate) {
            onParticipantsUpdate(participants);
        }
    }, [participants, onParticipantsUpdate]);

    useEffect(() => {
        if (!roomId || !user) return;

        // Prevent double initialization
        if (pusherRef.current) return;

        // Pusher.logToConsole = true; // Uncomment for debugging

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
            authEndpoint: '/api/pusher/auth',
            auth: {
                params: {
                    username: user.name,
                    user_id: user.id || user._id, // Ensure ID is passed
                    avatar: user.avatar
                }
            }
        });

        pusherRef.current = pusher;

        const channelName = `presence-room-${roomId}`;
        const channel = pusher.subscribe(channelName);
        channelRef.current = channel;

        // Connection Events
        channel.bind('pusher:subscription_succeeded', (members) => {
            setIsConnected(true);
            const initialMembers = [];
            members.each((member) => initialMembers.push(member.info));
            setParticipants(initialMembers);
        });

        channel.bind('pusher:member_added', (member) => {
            setParticipants((prev) => [...prev, member.info]);
            setMessages((prev) => [...prev, {
                system: true,
                text: `${member.info.name} joined the room`
            }]);
        });

        channel.bind('pusher:member_removed', (member) => {
            setParticipants((prev) => prev.filter((p) => p.name !== member.info.name)); // Using name as ID fallback if needed
            setMessages((prev) => [...prev, {
                system: true,
                text: `${member.info.name} left the room`
            }]);
        });

        // Chat Events
        channel.bind('message', (data) => {
            setMessages((prev) => [...prev, data]);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => {
            if (pusherRef.current) {
                pusherRef.current.unsubscribe(channelName);
                pusherRef.current.disconnect();
                pusherRef.current = null;
            }
        };
    }, [roomId, user]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageData = {
            roomId,
            message: input,
            user: {
                name: user?.name || 'Anonymous',
                avatar: user?.avatar,
            },
        };

        try {
            await fetch('/api/pusher/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });
            setInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

            {/* Connection Status */}
            {!isConnected && (
                <div className="bg-yellow-50 text-yellow-700 text-xs px-4 py-1 flex items-center justify-center">
                    Connecting to secure channel...
                </div>
            )}

            {/* Participant List (Mini) */}
            {participants.length > 0 && (
                <div className="bg-emerald-50 px-4 py-2 flex gap-2 overflow-x-auto border-b border-emerald-100 no-scrollbar">
                    {participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-emerald-100 shadow-sm flex-shrink-0">
                            <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center text-[10px] text-emerald-800 font-bold overflow-hidden">
                                {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" /> : p.name?.[0]}
                            </div>
                            <span className="text-xs text-emerald-900 truncate max-w-[80px]">{p.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
                {messages.length === 0 && isConnected && (
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
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    disabled={!isConnected}
                    className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm outline-none placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !isConnected}
                    className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                    <FaPaperPlane size={14} className="ml-0.5" />
                </button>
            </form>
        </div>
    );
}
