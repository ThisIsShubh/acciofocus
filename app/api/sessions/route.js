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

// Add to sessions array (not recentSessions to match schema)
const result = await User.findOneAndUpdate(
{ 'profile.id': userId },
{ 
$push: { recentSessions: newSession },
$set: { 'profile.lastActive': new Date() }
},
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
session: newSession
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