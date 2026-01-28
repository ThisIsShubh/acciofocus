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

    // Attempt to sync latest Clerk profile (avatar/name/email) to MongoDB when present
    try {
      const clerkCurrent = await currentUser();
      if (clerkCurrent) {
        const updateFields = {};
        if (clerkCurrent.imageUrl && clerkCurrent.imageUrl !== user.profile.avatar) {
          updateFields['profile.avatar'] = clerkCurrent.imageUrl;
        }
        const clerkName = `${clerkCurrent.firstName || ''} ${clerkCurrent.lastName || ''}`.trim();
        if (clerkName && clerkName !== user.profile.name) {
          updateFields['profile.name'] = clerkName;
        }
        if (clerkCurrent.emailAddresses?.[0]?.emailAddress && clerkCurrent.emailAddresses[0].emailAddress !== user.profile.email) {
          updateFields['profile.email'] = clerkCurrent.emailAddresses[0].emailAddress;
        }

        if (Object.keys(updateFields).length > 0) {
          const { default: connectDB } = await import('@/config/db');
          const { default: User } = await import('@/models/user');
          await connectDB();
          user = await User.findOneAndUpdate(
            { 'profile.id': userId },
            { $set: updateFields },
            { new: true }
          );
          console.log('Synced Clerk profile to MongoDB for user:', userId, updateFields);
        }
      }
    } catch (syncErr) {
      console.error('Error syncing Clerk profile on GET /api/user/me:', syncErr);
      // continue without failing the request
    }

    // --- Stats Backfill Logic ---
    // Check if user has sessions but no total study time (indicates missing stats)
    if (user.recentSessions && user.recentSessions.length > 0) {
      const currentStats = user.stats || {};

      if (!currentStats.totalStudyTime) {
        console.log('Detected sessions but missing stats. Recalculating...');

        const newStats = {
          totalStudyTime: 0,
          weeklyStudyTime: 0,
          dailyAverage: 0,
          sessionsCompleted: 0,
          focusRate: 0,
          subjects: {},
          productivityTrend: [],
          roomsCreated: currentStats.roomsCreated || 0,
          roomsJoined: currentStats.roomsJoined || 0,
          collaborativeHours: currentStats.collaborativeHours || 0
        };

        const trendMap = new Map(); // date string (YYYY-MM-DD) -> minutes

        user.recentSessions.forEach(session => {
          const duration = session.duration || 0;
          newStats.totalStudyTime += duration;
          newStats.sessionsCompleted += 1;

          // Subjects
          if (session.subject) {
            const safeSubject = session.subject.replace(/\./g, '_');
            newStats.subjects[safeSubject] = (newStats.subjects[safeSubject] || 0) + duration;
          }

          // Trend
          if (session.date) {
            const dateObj = new Date(session.date);
            if (!isNaN(dateObj)) {
              const dateKey = dateObj.toISOString().split('T')[0];
              trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + duration);
            }
          }
        });

        // Convert trend map to array
        newStats.productivityTrend = Array.from(trendMap.entries())
          .map(([date, minutes]) => ({
            date: new Date(date),
            minutes
          }))
          .sort((a, b) => a.date - b.date);

        // Update user in DB
        try {
          const { default: User } = await import('@/models/user');
          const { default: connectDB } = await import('@/config/db');
          await connectDB();

          user = await User.findOneAndUpdate(
            { 'profile.id': userId },
            { $set: { stats: newStats } },
            { new: true }
          );
          console.log('Stats successfully recalculated and saved.');
        } catch (dbErr) {
          console.error('Failed to update recalculated stats:', dbErr);
        }
      }
    }

    // Update last active timestamp
    await updateUserLastActive(userId);

    // Return user data (excluding sensitive information)
    // Build avatar URL with a cache-busting query param based on user.updatedAt
    let avatarUrl = user.profile.avatar || '/default-avatar.png';
    try {
      const ts = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
      if (avatarUrl && typeof avatarUrl === 'string') {
        const separator = avatarUrl.includes('?') ? '&' : '?';
        avatarUrl = `${avatarUrl}${separator}v=${ts}`;
      }
    } catch (err) {
      console.warn('Unable to append cache buster to avatar URL', err);
    }

    const userData = {
      profile: user.profile,
      id: user.profile.id,
      name: user.profile.name,
      email: user.profile.email,
      avatar: avatarUrl,
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
    const { userId } = await auth();

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