import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const data = await req.formData();
        const socketId = data.get('socket_id');
        const channel = data.get('channel_name');
        const username = data.get('username') || 'Anonymous';
        const userId = data.get('user_id') || `user-${Date.now()}`;
        const avatar = data.get('avatar');

        const userData = {
            user_id: userId,
            user_info: {
                name: username,
                avatar: avatar,
            },
        };

        const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
        return NextResponse.json(authResponse);
    } catch (error) {
        console.error('Pusher Auth Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
