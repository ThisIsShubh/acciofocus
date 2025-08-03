// app/api/rooms/[roomId]/leave/route.js
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import connectDB from '@/config/db';
import User from '@/models/user';

export async function DELETE(request, { params }) {
  try {
    const authResult = auth();
    if (!authResult?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { roomId } = params;

    const user = await User.findOne({ 'profile.email': session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const room = user.studyRooms[roomIndex];

    // Remove user from room
    user.studyRooms.splice(roomIndex, 1);

    // Update participant count in all other users who have this room
    const otherUsers = await User.find({ 
      'studyRooms.id': roomId,
      'profile.email': { $ne: session.user.email }
    });

    for (const otherUser of otherUsers) {
      const otherRoomIndex = otherUser.studyRooms.findIndex(r => r.id === roomId);
      if (otherRoomIndex !== -1) {
        // Remove user from members list
        const members = otherUser.studyRooms[otherRoomIndex].members || [];
        otherUser.studyRooms[otherRoomIndex].members = members.filter(
          memberId => memberId !== user.profile.id
        );
        
        // Decrease participant count
        otherUser.studyRooms[otherRoomIndex].participants = Math.max(
          0, 
          otherUser.studyRooms[otherRoomIndex].participants - 1
        );
        
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
      message: 'Successfully left room'
    });

  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json(
      { error: 'Failed to leave room' },
      { status: 500 }
    );
  }
}