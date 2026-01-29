import { pusherServer } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { message, roomId, user } = await req.json();

        await pusherServer.trigger(`presence-room-${roomId}`, 'message', {
            message,
            user,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Pusher Send Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
