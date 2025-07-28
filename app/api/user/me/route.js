import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserByClerkId, updateUserLastActive } from '@/helpers/userSync';

export async function GET() {
  try {
    console.log('=== /api/user/me GET request ===');
    
    const authResult = await auth();
    console.log('Auth result:', authResult);
    
    const { userId } = authResult;
    console.log('Extracted userId:', userId);

    if (!userId) {
      console.log('No userId found - returning 401');
      return NextResponse.json(
        { error: 'Unauthorized - No userId found' },
        { status: 401 }
      );
    }

    // Get user from MongoDB
    console.log('Looking for user in database with clerkId:', userId);
    let user = await getUserByClerkId(userId);
    console.log('User found in database:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database, attempting to create...');
      // Try to create user if they don't exist (fallback for users who signed up before webhook was set up)
      try {
        const { syncUserToMongoDB } = await import('@/helpers/userSync');
        
        console.log('Getting current user from Clerk...');
        const clerkUser = await currentUser();
        console.log('Clerk user data:', clerkUser ? {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
        } : 'No clerk user found');
        
        if (clerkUser) {
          user = await syncUserToMongoDB(clerkUser);
          console.log('User created via fallback mechanism:', user.profile.id);
        } else {
          console.log('No clerk user found - cannot create user');
          return NextResponse.json(
            { error: 'User not found and unable to create - no Clerk user data' },
            { status: 404 }
          );
        }
      } catch (syncError) {
        console.error('Error creating user via fallback:', syncError);
        return NextResponse.json(
          { error: 'User not found and unable to create - sync error' },
          { status: 404 }
        );
      }
    }

    // Update last active timestamp
    await updateUserLastActive(userId);

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.profile.id,
      name: user.profile.name,
      email: user.profile.email,
      avatar: user.profile.avatar,
      joinDate: user.profile.joinDate,
      lastActive: user.profile.lastActive,
      streak: user.profile.streak,
      level: user.profile.level,
      xp: user.profile.xp,
      nextLevelXp: user.profile.nextLevelXp,
      bio: user.profile.bio,
      stats: user.stats,
      goals: user.goals,
      recentSessions: user.recentSessions,
      tasks: user.tasks,
      friends: user.friends,
      achievements: user.achievements,
      studyRooms: user.studyRooms
    };

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bio, name } = body;

    // Only allow updating certain fields
    const updateData = {};
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (name !== undefined) updateData['profile.name'] = name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update user in MongoDB
    const { getUserByClerkId } = await import('@/helpers/userSync');
    const { default: connectDB } = await import('@/config/db');
    const { default: User } = await import('@/models/user');

    await connectDB();
    
    const updatedUser = await User.findOneAndUpdate(
      { 'profile.id': userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.profile.id,
        name: updatedUser.profile.name,
        bio: updatedUser.profile.bio
      }
    });

  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 