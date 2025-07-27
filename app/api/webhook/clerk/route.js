import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    const payload = await req.text();
    const headerPayload = await headers();

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    let evt;
    
    try {
      evt = wh.verify(payload, {
        'svix-id': headerPayload.get('svix-id'),
        'svix-timestamp': headerPayload.get('svix-timestamp'),
        'svix-signature': headerPayload.get('svix-signature'),
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const { type, data } = evt;
    console.log(`Processing webhook event: ${type}`);

    // Handle user creation
    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url, created_at } = data;

      // Connect to database
      await connectDB();

      // Check if user already exists
      const existingUser = await User.findOne({ 'profile.id': id });

      if (!existingUser) {
        // Create new user in MongoDB
        const newUser = await User.create({
          profile: {
            id,
            name: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous Pineapple',
            email: email_addresses?.[0]?.email_address || '',
            avatar: image_url || '',
            joinDate: new Date(created_at * 1000),
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

        console.log(`User created successfully: ${newUser.profile.id}`);
      } else {
        console.log(`User already exists: ${id}`);
      }
    }

    // Handle user updates
    if (type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = data;

      await connectDB();

      const updateData = {};
      if (first_name || last_name) {
        updateData['profile.name'] = `${first_name || ''} ${last_name || ''}`.trim();
      }
      if (email_addresses?.[0]?.email_address) {
        updateData['profile.email'] = email_addresses[0].email_address;
      }
      if (image_url) {
        updateData['profile.avatar'] = image_url;
      }

      if (Object.keys(updateData).length > 0) {
        await User.findOneAndUpdate(
          { 'profile.id': id },
          { $set: updateData },
          { new: true }
        );
        console.log(`User updated successfully: ${id}`);
      }
    }

    // Handle user deletion
    if (type === 'user.deleted') {
      const { id } = data;

      await connectDB();
      
      const deletedUser = await User.findOneAndDelete({ 'profile.id': id });
      if (deletedUser) {
        console.log(`User deleted successfully: ${id}`);
      }
    }

    return NextResponse.json({ success: true, event: type });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
