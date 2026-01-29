import { Server as ServerIO } from 'socket.io'

export const config = {
    api: {
        bodyParser: false,
    },
}

console.log("!!! SOCKET IO MODULE LOADED v2 !!!");

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        // Adapt to Next.js dev server hot-reloading (singleton pattern)
        if (globalThis.io) {
            console.log(`!!! REUSING GLOBAL SOCKET SERVER (ID: ${globalThis.io._serverId}) !!!`);
            res.socket.server.io = globalThis.io;
        } else {
            console.log('!!! STARTING NEW SOCKET SERVER !!!')
            const httpServer = res.socket.server
            const io = new ServerIO(httpServer, {
                path: '/api/socket/io',
                addTrailingSlash: false,
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            })

            // Assign a random ID to this server instance to track split-brain issues
            io._serverId = Math.random().toString(36).substring(7);
            console.log(`New Socket.io Server Created. Server ID: ${io._serverId}`);

            res.socket.server.io = io;
            globalThis.io = io; // Save to global

            // Simple memory store for participants: roomId -> Set<User>
            // Note: This resets on server restart (which happens often in dev/serverless).
            // For production, use Redis.
            const roomParticipants = new Map();
            const roomMessages = new Map(); // Store chat history

            globalThis.roomParticipants = roomParticipants; // Save map to global too
            globalThis.roomMessages = roomMessages;

            io.on('connection', (socket) => {
                handleSocketConnection(io, socket, roomParticipants, roomMessages);
            })
        }
    } else {
        // console.log('Socket.io server already running')
    }
    res.end()
}

// Extracted handler to keep things clean and strictly scoped
const handleSocketConnection = (io, socket, roomParticipants, roomMessages) => {
    console.log(`!!! SOCKET CONNECTED: ${socket.id} (Server ID: ${io._serverId}) !!!`);

    // EMIT DEBUG INFO TO CLIENT
    socket.emit('server-debug-info', {
        serverId: io._serverId,
        socketId: socket.id
    });

    socket.on('join-room', ({ roomId, user }) => {
        const roomStr = String(roomId);
        socket.join(roomStr);

        // 1. Handle Participants
        if (!roomParticipants.has(roomStr)) {
            roomParticipants.set(roomStr, new Set());
        }
        const participants = roomParticipants.get(roomStr);

        // We use a simplified user object for tracking
        const userData = {
            socketId: socket.id,
            name: user?.name || 'Anonymous',
            avatar: user?.avatar || null,
            userId: user?.id || socket.id
        };

        // Remove any existing entry for this socket (cleanup just in case)
        for (const p of participants) {
            if (p.socketId === socket.id) participants.delete(p);
        }
        participants.add(userData);

        console.log(`Socket ${socket.id} joined room ${roomStr} as ${userData.name}`);

        // Broadcast updated list
        io.to(roomStr).emit('update-participants', Array.from(participants));

        // 2. Handle Message History
        if (!roomMessages.has(roomStr)) {
            roomMessages.set(roomStr, []);
        }
        const history = roomMessages.get(roomStr);
        // Send history ONLY to the joining user
        socket.emit('message-history', history);


        // Notify others
        const systemMsg = {
            system: true,
            text: `${userData.name} joined the room`,
            timestamp: new Date()
        };
        // Don't save join/leave messages to history (optional preference, keeps valid chat clean)
        socket.to(roomStr).emit('receive-message', systemMsg);
    });

    socket.on('send-message', (messageData) => {
        console.log(`SERVER (ID: ${io._serverId}): Message received:`, messageData);
        const roomStr = String(messageData.roomId);

        // Save to History
        if (!roomMessages.has(roomStr)) {
            roomMessages.set(roomStr, []);
        }
        const messages = roomMessages.get(roomStr);
        messages.push(messageData);

        // Keep only last 50 messages
        if (messages.length > 50) messages.shift();

        // Broadcast to ALL (including sender, for confirmation)
        io.to(roomStr).emit('receive-message', messageData);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id} (Server ID: ${io._serverId})`);

        // Find and remove user from all rooms
        roomParticipants.forEach((participants, roomId) => {
            let userRemoved = false;
            let removedUserName = '';

            for (const p of participants) {
                if (p.socketId === socket.id) {
                    participants.delete(p);
                    userRemoved = true;
                    removedUserName = p.name;
                    break;
                }
            }

            if (userRemoved) {
                io.to(roomId).emit('update-participants', Array.from(participants));
                // Optional: broadcast leave message
                io.to(roomId).emit('receive-message', {
                    system: true,
                    text: `${removedUserName} left the room`,
                    timestamp: new Date()
                });
            }
        });
    });
}

export default ioHandler
