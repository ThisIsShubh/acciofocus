// /api/user.js
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET(req) {
  const authResult = auth();
  console.log('DEBUG: Clerk auth() result:', authResult);
  const { userId } = authResult;
  await connectDB();

  if (!userId) {
    console.log('DEBUG: No userId found in Clerk session.');
    return new Response(JSON.stringify({ error: "No userId found. Are you signed in?" }), { status: 401 });
  }

  try {
    const user = await User.findOne({ 'profile.id': userId });
    if (!user) {
      console.log('DEBUG: No user found in DB for userId:', userId);
      return new Response(JSON.stringify({ error: "No user found in DB for this userId", userId }), { status: 404 });
    }
    return Response.json(user);
  } catch (err) {
    console.error('DEBUG: Error fetching user from DB:', err);
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { status: 500 });
  }
}
