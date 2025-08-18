// app/api/study/rooms/[roomId]/favorite/route.js
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/config/db';
import User from '@/models/user';

export async function PATCH(request, { params }) {
  try {
    const authResult = auth();
    // Fix: Clerk's auth() returns { userId, ... }, not user.email
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { roomId } = params;

    // Find user by Clerk userId
    const user = await User.findOne({ 'auth.clerkId': authResult.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
    if (roomIndex === -1 || roomIndex === undefined) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Toggle favorite status
    user.studyRooms[roomIndex].favorite = !user.studyRooms[roomIndex].favorite;
    await user.save();

    return NextResponse.json({ 
      success: true,
      favorite: user.studyRooms[roomIndex].favorite
    });

  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}