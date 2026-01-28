import { Server as ServerIO } from 'socket.io'

export const config = {
    api: {
        bodyParser: false,
    },
}

const ioHandler = (req, res) => {
    if (!res.socket.server.io) {
        console.log('Starting Socket.io server...')
        const httpServer = res.socket.server
        const io = new ServerIO(httpServer, {
            path: '/api/socket/io',
            addTrailingSlash: false,
        })

        // Simple memory store for participants: roomId -> Set<User>
        // Note: This resets on server restart (which happens often in dev/serverless).
        // For production, use Redis.
        const roomParticipants = new Map();

        io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id);

            socket.on('join-room', ({ roomId, user }) => {
                socket.join(roomId);

                // Add user to room participants
                if (!roomParticipants.has(roomId)) {
                    roomParticipants.set(roomId, new Set());
                }
                const participants = roomParticipants.get(roomId);

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

                console.log(`Socket ${socket.id} joined room ${roomId} as ${userData.name}`);

                // Broadcast updated list
                io.to(roomId).emit('update-participants', Array.from(participants));

                // Notify others
                socket.to(roomId).emit('receive-message', {
                    system: true,
                    text: `${userData.name} joined the room`,
                    timestamp: new Date()
                });
            });

            socket.on('send-message', (messageData) => {
                console.log('Message received:', messageData);
                io.to(messageData.roomId).emit('receive-message', messageData);
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected:', socket.id);

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
        })

        res.socket.server.io = io
    } else {
        console.log('Socket.io server already running')
    }
    res.end()
}

export default ioHandler
