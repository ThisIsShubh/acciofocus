// app/api/tasks/route.js
import connectDB from '@/config/db';
import { auth } from '@clerk/nextjs/server';
import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';

// GET handler - Fetch all tasks for the authenticated user
export async function GET(req) {
  const authResult = await auth();
  
  if (!authResult.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  await connectDB();

  try {
    const user = await User.findOne({ 'profile.id': authResult.userId });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return Response.json(user.tasks || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch tasks' }), { status: 500 });
  }
}

// POST handler - Create a new task for the authenticated user
export async function POST(req) {
  const authResult = await auth();
  
  if (!authResult.userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  await connectDB();

  try {
    const body = await req.json();
    const { title, subject, priority, dueDate } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
    }

    const newTask = {
      id: uuidv4(),
      title,
      subject: subject || '',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      createdAt: new Date(),
      completed: false
    };

    const updatedUser = await User.findOneAndUpdate(
      { 'profile.id': authResult.userId },
      { $push: { tasks: newTask } },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(newTask), { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new Response(JSON.stringify({ error: 'Failed to create task' }), { status: 500 });
  }
}