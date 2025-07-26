import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';

export async function POST(req) {
  const payload = await req.text();
  const headerPayload = await headers();

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

  if (type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = data;

    await connectDB();

    const existingUser = await User.findOne({ 'profile.id': id });

    if (!existingUser) {
      await User.create({
        profile: {
          id,
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          email: email_addresses[0]?.email_address || '',
          avatar: image_url,
          joinDate: new Date(),
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
          productivityTrend: []
        },
        goals: [],
        recentSessions: [],
        tasks: [],
        friends: [],
        achievements: [],
        studyRooms: []
      });
    }
  }

  return NextResponse.json({ success: true });
}
