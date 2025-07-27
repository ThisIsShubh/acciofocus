// app/api/tasks/[id]/route.js - Update/Delete specific task
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import User from '@/models/User';

// Helper function to get the task ID from the URL
function getTaskId(url) {
  const pathParts = url.split('/');
  return pathParts[pathParts.length - 1];
}

// PUT handler - Update a specific task
export async function PUT(req) {
  const authResult = await auth();
  
  if (!authResult.userId) {
    return new Response(JSON.stringify({ 
      error: 'Not authenticated',
      details: 'User ID not found in authentication result'
    }), { status: 401 });
  }

  const userId = authResult.userId;
  const taskId = getTaskId(req.url);
  
  console.log(`PUT /api/tasks/${taskId} - User ID: ${userId}`);
  
  await connectDB();

  try {
    const body = await req.json();
    
    // Find the user first
    const user = await User.findOne({ 'profile.id': userId });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    
    // Find the task index in the user's tasks array
    const taskIndex = user.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return new Response(JSON.stringify({ 
        error: 'Task not found',
        details: `Task ID ${taskId} not found for user ${userId}`
      }), { status: 404 });
    }
    
    // Update the task fields while preserving the id
    const updatedTask = {
      ...user.tasks[taskIndex],
      ...body,
      id: taskId // Ensure the ID doesn't change
    };
    
    // Update the task in the array using MongoDB's positional operator
    const result = await User.findOneAndUpdate(
      { 'profile.id': userId, 'tasks.id': taskId },
      { $set: { 'tasks.$': updatedTask } },
      { new: true }
    );
    
    if (!result) {
      return new Response(JSON.stringify({ 
        error: 'Failed to update task',
        details: 'Database update operation failed'
      }), { status: 500 });
    }
    
    // Find the updated task in the result
    const updatedTaskInResult = result.tasks.find(task => task.id === taskId);
    
    return Response.json(updatedTaskInResult);
  } catch (error) {
    console.error('Error updating task:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update task',
      details: error.message 
    }), { status: 500 });
  }
}

// DELETE handler - Delete a specific task
export async function DELETE(req) {
  const authResult = await auth();
  
  if (!authResult.userId) {
    return new Response(JSON.stringify({ 
      error: 'Not authenticated',
      details: 'User ID not found in authentication result'
    }), { status: 401 });
  }

  const userId = authResult.userId;
  const taskId = getTaskId(req.url);
  
  console.log(`DELETE /api/tasks/${taskId} - User ID: ${userId}`);
  
  await connectDB();

  try {
    // Remove the task from the user's tasks array using $pull
    const result = await User.findOneAndUpdate(
      { 'profile.id': userId },
      { $pull: { tasks: { id: taskId } } },
      { new: true }
    );
    
    if (!result) {
      return new Response(JSON.stringify({ 
        error: 'User not found',
        details: `User ${userId} not found in database`
      }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ 
      message: 'Task deleted successfully',
      taskId: taskId
    }), { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete task',
      details: error.message 
    }), { status: 500 });
  }
}