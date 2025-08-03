// app/api/study/rooms/create/route.js
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/config/db';
import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';

function generateRoomKey() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request) {

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, description, isPrivate, maxParticipants, category } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Find user by Clerk ID (profile.id)
    const user = await User.findOne({ 'profile.id': userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roomId = uuidv4();
    const newRoom = {
      id: roomId,
      name: name.trim(),
      description: description?.trim() || '',
      participants: 1, // Creator is first participant
      lastActive: new Date(),
      totalSessions: 0,
      favorite: false,
      isPrivate: Boolean(isPrivate),
      privateKey: isPrivate ? generateRoomKey() : null,
      maxParticipants: Math.max(2, Math.min(50, maxParticipants || 10)),
      category: category || 'General',
      createdBy: user.profile.id,
      createdAt: new Date(),
      members: [user.profile.id]
    };
    // Add room to user's studyRooms
    user.studyRooms = user.studyRooms || [];
    user.studyRooms.unshift(newRoom);

    await user.save();

    return NextResponse.json({ 
      success: true, 
      room: newRoom,
      message: 'Room created successfully'
    });

  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}