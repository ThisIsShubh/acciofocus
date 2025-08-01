import connectDB from '@/config/db';
import User from '@/models/user';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, bio } = body;

    if (!userId || !bio) {
      return new Response(JSON.stringify({ message: 'Missing userId or bio' }), { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ 'profile.id': userId });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    user.profile.bio = bio.trim();
    await user.save();

    return new Response(JSON.stringify({ bio: user.profile.bio }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
