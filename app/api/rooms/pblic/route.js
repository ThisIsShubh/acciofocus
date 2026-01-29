// app/api/rooms/pblic/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/user';

export async function GET() {
  try {
    await connectDB();

    // Get all users and extract public study rooms
    const users = await User.find({}, 'studyRooms');
    const publicRoomsMap = new Map();

    users.forEach(user => {
      if (user.studyRooms) {
        user.studyRooms.forEach(room => {
          if (!room.isPrivate) {
            if (!publicRoomsMap.has(room.id)) {
              publicRoomsMap.set(room.id, {
                ...room.toObject(),
                ownerId: user._id
              });
            }
          }
        });
      }
    });

    const publicRooms = Array.from(publicRoomsMap.values());

    // Sort by most recent activity
    publicRooms.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    return NextResponse.json({ rooms: publicRooms });
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public rooms' },
      { status: 500 }
    );
  }
}