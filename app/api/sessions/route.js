import connectDB from '@/config/db';
import { auth } from '@clerk/nextjs/server';
import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';

// POST /api/sessions - Save a session
export async function POST(req) {
const { userId } = await auth();
console.log('POST /api/sessions called with userId:', userId);
if (!userId) {
return new Response(JSON.stringify({ error: 'Not authenticated' }), {
status: 401,
headers: { 'Content-Type': 'application/json' }
});
}

await connectDB();
console.log('Connected to MongoDB for session save');

try {
const sessionData = await req.json();
console.log('Session data received:', sessionData);

// Validate required fields
if (!sessionData.date || !sessionData.duration || !sessionData.subject) {
return new Response(JSON.stringify({ 
error: 'Missing required fields: date, duration, and subject are required' 
}), {
status: 400,
headers: { 'Content-Type': 'application/json' }
});
}

// Ensure environment object has required structure
const environment = {
background: sessionData.environment?.background || '',
sounds: Array.isArray(sessionData.environment?.sounds) ? sessionData.environment.sounds : [],
mode: sessionData.environment?.mode || 'solo',
roomName: sessionData.environment?.roomName || 'Solo Study'
};

const newSession = {
id: uuidv4(),
date: new Date(sessionData.date),
duration: Number(sessionData.duration),
subject: sessionData.subject,
focusScore: Number(sessionData.focusScore) || 0,
environment
};


// --- Streak Logic ---
// Fetch user to get recentSessions and streak
const user = await User.findOne({ 'profile.id': userId });
if (!user) {
  return new Response(JSON.stringify({ error: 'User not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

let streak = user.profile.streak || 0;
let lastStreakUpdate = user.profile.lastStreakUpdate ? new Date(user.profile.lastStreakUpdate) : null;
const today = new Date();
today.setHours(0,0,0,0);

// Find the most recent session date (excluding the one being added)
let lastSessionDate = null;
if (user.recentSessions && user.recentSessions.length > 0) {
  // Sort sessions by date descending
  const sorted = [...user.recentSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  lastSessionDate = new Date(sorted[0].date);
  lastSessionDate.setHours(0,0,0,0);
}

// Only update streak if not already updated today
let shouldUpdateStreak = true;
if (lastStreakUpdate) {
  const lastUpdateDay = new Date(lastStreakUpdate);
  lastUpdateDay.setHours(0,0,0,0);
  if (lastUpdateDay.getTime() === today.getTime()) {
    shouldUpdateStreak = false;
  }
}

let newStreak = streak;
if (shouldUpdateStreak) {
  if (lastSessionDate) {
    const diffDays = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak = streak + 1;
    } else if (diffDays === 0) {
      // Already counted today, do not increment
      newStreak = streak;
    } else {
      newStreak = 1; // Reset streak
    }
  } else {
    newStreak = 1; // First session ever
  }
}

// Add to sessions and update streak/lastActive/lastStreakUpdate
const updateFields = {
  $push: { recentSessions: newSession },
  $set: {
    'profile.lastActive': new Date(),
    ...(shouldUpdateStreak ? { 'profile.streak': newStreak, 'profile.lastStreakUpdate': today } : {})
  }
};

const result = await User.findOneAndUpdate(
  { 'profile.id': userId },
  updateFields,
  { new: true, upsert: true }
);

if (!result) {
  return new Response(JSON.stringify({ error: 'Failed to save session' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}

return new Response(JSON.stringify({ 
  message: 'Session saved successfully',
  session: newSession,
  streak: result.profile.streak
}), { 
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});

} catch (error) {
console.error('Error saving session:', error);
return new Response(JSON.stringify({ 
error: 'Failed to save session',
details: error.message 
}), { 
status: 500,
headers: { 'Content-Type': 'application/json' }
});
}
}

// GET /api/sessions - Get recent sessions
export async function GET() {
const { userId } = await auth();
if (!userId) {
return new Response(JSON.stringify({ error: 'Not authenticated' }), {
status: 401,
headers: { 'Content-Type': 'application/json' }
});
}

await connectDB();

try {
const user = await User.findOne({ 'profile.id': userId });

if (!user) {
// Return empty array for new users instead of error
return new Response(JSON.stringify([]), { 
status: 200,
headers: { 'Content-Type': 'application/json' }
});
}

// Get sessions from the sessions array (not recentSessions)
const sessions = user.recentSessions || [];

// Sort sessions by date descending and limit to 10 most recent
const recentSessions = [...sessions]
.sort((a, b) => new Date(b.date) - new Date(a.date))
.slice(0, 10);

return new Response(JSON.stringify(recentSessions), { 
status: 200,
headers: { 'Content-Type': 'application/json' }
});

} catch (error) {
console.error('Error fetching sessions:', error);
return new Response(JSON.stringify({ 
error: 'Failed to fetch sessions',
details: error.message 
}), { 
status: 500,
headers: { 'Content-Type': 'application/json' }
});
}
}

// DELETE /api/sessions/[id] - Delete a specific session (optional feature)
export async function DELETE(req) {
const { userId } = await auth();
if (!userId) {
return new Response(JSON.stringify({ error: 'Not authenticated' }), {
status: 401,
headers: { 'Content-Type': 'application/json' }
});
}

await connectDB();

try {
const url = new URL(req.url);
const sessionId = url.pathname.split('/').pop();

if (!sessionId) {
return new Response(JSON.stringify({ error: 'Session ID required' }), {
status: 400,
headers: { 'Content-Type': 'application/json' }
});
}

const result = await User.findOneAndUpdate(
{ 'profile.id': userId },
{ $pull: { sessions: { id: sessionId } } },
{ new: true }
);

if (!result) {
return new Response(JSON.stringify({ error: 'User not found' }), {
status: 404,
headers: { 'Content-Type': 'application/json' }
});
}

return new Response(JSON.stringify({ message: 'Session deleted successfully' }), { 
status: 200,
headers: { 'Content-Type': 'application/json' }
});

} catch (error) {
console.error('Error deleting session:', error);
return new Response(JSON.stringify({ 
error: 'Failed to delete session',
details: error.message 
}), { 
status: 500,
headers: { 'Content-Type': 'application/json' }
});
}
}