// app/api/study/rooms/[roomId]/route.js
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/config/db';
import User from '@/models/user';

export async function GET(request, { params }) {
  try {
    const authResult = auth();
    if (!authResult?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { roomId } = params;

    // Find the room across all users
    const users = await User.find({ 'studyRooms.id': roomId });
    let roomData = null;
    let members = [];

    for (const user of users) {
      const room = user.studyRooms.find(r => r.id === roomId);
      if (room) {
        if (!roomData) {
          roomData = room;
        }
        // Collect member info
        members.push({
          id: user.profile.id,
          name: user.profile.name,
          avatar: user.profile.avatar,
          lastActive: user.profile.lastActive,
          streak: user.profile.streak
        });
      }
    }

    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      room: roomData,
      members: members,
      memberCount: members.length
    });

  } catch (error) {
    console.error('Error fetching room details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { roomId } = params;
    const updates = await request.json();

    const user = await User.findOne({ 'profile.email': session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = user.studyRooms[roomIndex];

    // Check if user is the room creator
    if (room.createdBy !== user.profile.id) {
      return NextResponse.json({ error: 'Only room creator can edit room' }, { status: 403 });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'maxParticipants', 'category'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        room[field] = updates[field];
      }
    });

    room.lastActive = new Date();

    // Update the room in all users who have joined it
    const otherUsers = await User.find({ 
      'studyRooms.id': roomId,
      'profile.email': { $ne: session.user.email }
    });

    for (const otherUser of otherUsers) {
      const otherRoomIndex = otherUser.studyRooms.findIndex(r => r.id === roomId);
      if (otherRoomIndex !== -1) {
        allowedUpdates.forEach(field => {
          if (updates[field] !== undefined) {
            otherUser.studyRooms[otherRoomIndex][field] = updates[field];
          }
        });
        otherUser.studyRooms[otherRoomIndex].lastActive = new Date();
      }
    }

    // Save all changes
    await Promise.all([
      user.save(),
      ...otherUsers.map(u => u.save())
    ]);

    return NextResponse.json({ 
      success: true,
      room: room,
      message: 'Room updated successfully'
    });

  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}
