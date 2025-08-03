// app/api/study/rooms/join/route.js
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/config/db';
import User from '@/models/user';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { roomId, privateKey } = await request.json();

    const user = await User.findOne({ 'profile.id': userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user is already in this room
    const existingRoom = user.studyRooms?.find(room => room.id === roomId);
    if (existingRoom) {
      return NextResponse.json({ error: 'Already joined this room' }, { status: 400 });
    }

    let roomToJoin = null;
    let roomOwnerUser = null;

    if (roomId) {
      // Join by room ID (public room)
      const users = await User.find({ 'studyRooms.id': roomId });
      for (const user of users) {
        const room = user.studyRooms.find(r => r.id === roomId);
        if (room && !room.isPrivate) {
          roomToJoin = room;
          roomOwnerUser = user;
          break;
        }
      }
    } else if (privateKey) {
      // Join by private key
      const users = await User.find({ 'studyRooms.privateKey': privateKey });
      for (const user of users) {
        const room = user.studyRooms.find(r => r.privateKey === privateKey);
        if (room) {
          roomToJoin = room;
          roomOwnerUser = user;
          break;
        }
      }
    }

    if (!roomToJoin) {
      return NextResponse.json({ error: 'Room not found or invalid key' }, { status: 404 });
    }

    // Check if room is full
    if (roomToJoin.participants >= roomToJoin.maxParticipants) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }


    // Add user to room members and increment participants
    roomToJoin.members = roomToJoin.members || [];
    if (!roomToJoin.members.includes(user.profile.id)) {
      roomToJoin.members.push(user.profile.id);
      roomToJoin.participants += 1;
      roomToJoin.lastActive = new Date();
    }

    // Add room to current user's studyRooms
    const userRoom = {
      ...roomToJoin.toObject(),
      favorite: false // New joins start as non-favorite
    };
    
    user.studyRooms = user.studyRooms || [];
    user.studyRooms.unshift(userRoom);

    // Update both users
    await Promise.all([
      user.save(),
      roomOwnerUser.save()
    ]);

    return NextResponse.json({ 
      success: true, 
      room: userRoom,
      message: 'Successfully joined room'
    });

  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    );
  }
}