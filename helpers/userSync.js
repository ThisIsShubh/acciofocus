import connectDB from '@/config/db';
import User from '@/models/user';

/**
 * Sync user data from Clerk to MongoDB
 * @param {Object} clerkUser - User data from Clerk
 * @returns {Object} - MongoDB user document
 */
export async function syncUserToMongoDB(clerkUser) {
  try {
    console.log('syncUserToMongoDB called with clerkUser:', {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
    });
    
    await connectDB();

    const { id, emailAddresses, firstName, lastName, imageUrl, createdAt } = clerkUser;

    // Check if user exists
    console.log('Checking if user exists with id:', id);
    let user = await User.findOne({ 'profile.id': id });
    console.log('User exists check result:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Creating new user...');
      // Create new user
      user = await User.create({
        profile: {
          id,
          name: `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous User',
          email: emailAddresses?.[0]?.emailAddress || '',
          avatar: imageUrl || '',
          joinDate: new Date(createdAt * 1000),
          lastActive: new Date(),
          streak: 0,
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          bio: ''
        },
        stats: {
          totalStudyTime: 0,
          weeklyStudyTime: 0,
          dailyAverage: 0,
          sessionsCompleted: 0,
          focusRate: 0,
          subjects: {},
          productivityTrend: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), minutes: 0 },
            { date: new Date(), minutes: 0 }
          ]
        },
        goals: [
          {
            id: "goal_1",
            title: "Complete Your First Study Session",
            description: "Start your learning journey with a focused study session",
            targetHours: 1,
            completedHours: 0,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "in-progress",
            category: "Getting Started"
          }
        ],
        recentSessions: [],
        tasks: [
          {
            id: "task_1",
            title: "Set up your study environment",
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            priority: "medium",
            completed: false,
            subject: "Getting Started"
          }
        ],
        friends: [],
        achievements: [
          {
            id: "ach_1",
            title: "Welcome to AccioFocus!",
            description: "Join the community of focused learners",
            earned: true,
            dateEarned: new Date(),
            icon: "🎉"
          }
        ],
        studyRooms: []
      });
    } else {
      console.log('Updating existing user...');
      // Update existing user
      const updateData = {};
      if (firstName || lastName) {
        updateData['profile.name'] = `${firstName || ''} ${lastName || ''}`.trim();
      }
      if (emailAddresses?.[0]?.emailAddress) {
        updateData['profile.email'] = emailAddresses[0].emailAddress;
      }
      if (imageUrl) {
        updateData['profile.avatar'] = imageUrl;
      }
      updateData['profile.lastActive'] = new Date();

      if (Object.keys(updateData).length > 0) {
        user = await User.findOneAndUpdate(
          { 'profile.id': id },
          { $set: updateData },
          { new: true }
        );
      }
    }

    return user;
  } catch (error) {
    console.error('Error syncing user to MongoDB:', error);
    throw error;
  }
}

/**
 * Get user from MongoDB by Clerk ID
 * @param {string} clerkId - Clerk user ID
 * @returns {Object|null} - MongoDB user document or null
 */
export async function getUserByClerkId(clerkId) {
  try {
    console.log('getUserByClerkId called with clerkId:', clerkId);
    await connectDB();
    const user = await User.findOne({ 'profile.id': clerkId });
    console.log('Database query result:', user ? 'User found' : 'User not found');
    return user;
  } catch (error) {
    console.error('Error getting user by Clerk ID:', error);
    throw error;
  }
}

/**
 * Update user's last active timestamp
 * @param {string} clerkId - Clerk user ID
 */
export async function updateUserLastActive(clerkId) {
  try {
    await connectDB();
    await User.findOneAndUpdate(
      { 'profile.id': clerkId },
      { $set: { 'profile.lastActive': new Date() } }
    );
  } catch (error) {
    console.error('Error updating user last active:', error);
    throw error;
  }
} 