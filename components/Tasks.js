// components/dashboard/TasksSection.js
'use client';
import React, { useState, useMemo } from 'react';
import { FaTasks, FaCheckCircle, FaEllipsisV, FaPlus, FaTrash } from 'react-icons/fa';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TasksSection({ taskList, setTaskList }) {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOption, setSortOption] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [newTask, setNewTask] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Sort tasks based on selected option
  const sortedTasks = useMemo(() => {
    return [...taskList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        
        case 'dueDate':
          comparison = new Date(a.dueDate) - new Date(b.dueDate);
          break;
          
        case 'creationDate':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
          
        default:
          comparison = a.title.localeCompare(b.title);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [taskList, sortOption, sortDirection]);

  // // Only display first 5 tasks - scroll for the rest
  // const displayedTasks = sortedTasks.slice(0, 5);

  // Toggle task completion with database update
  const toggleTaskCompletion = async (taskId) => {
    setLoading(true);
    try {
      const task = taskList.find(t => t.id === taskId);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (response.ok) {
        try {
          const updatedTask = await response.json();
          setTaskList(taskList.map(t => 
            t.id === taskId ? { ...t, completed: updatedTask.completed } : t
          ));
        } catch {
          setTaskList(taskList.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ));
        }
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new task to database
  const addTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          createdAt: new Date().toISOString() // Add creation date for sorting
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask = await response.json();
      setTaskList([...taskList, createdTask]);
      setNewTask({
        title: '',
        subject: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task from database
  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete task');
      }

      setTaskList(taskList.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting option selection
  const handleSortSelect = (option) => {
    if (sortOption === option) {
      // Toggle direction if same option selected
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new option with default ascending order
      setSortOption(option);
      setSortDirection('asc');
    }
    setShowSortMenu(false);
  };

  // Get display name for sort option
  const getSortDisplayName = () => {
    const directions = {
      asc: '↑',
      desc: '↓'
    };
    
    const names = {
      dueDate: 'Due Date',
      priority: 'Priority',
      creationDate: 'Creation Date'
    };
    
    return `${names[sortOption]} ${directions[sortDirection]}`;
  };

  return (
    <div className="bg-white max-h-[400px] rounded-2xl shadow-lg p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
          <FaTasks className="text-pink-500" /> Tasks
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-green-500 hover:text-green-600 p-1 rounded"
            disabled={loading}
          >
            <FaPlus />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <FaEllipsisV />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-xs text-gray-500 font-medium">Sort By</div>
                <button
                  onClick={() => handleSortSelect('dueDate')}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortOption === 'dueDate' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Due Date
                </button>
                <button
                  onClick={() => handleSortSelect('priority')}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortOption === 'priority' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Priority Level
                </button>
                <button
                  onClick={() => handleSortSelect('creationDate')}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortOption === 'creationDate' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Creation Date
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="px-4 py-2 text-xs text-gray-500">
                  Current: {getSortDisplayName()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <form onSubmit={addTask} className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={newTask.subject}
              onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
              required
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="low" className='bg-green-100 rounded-lg'>Low Priority</option>
              <option value="medium" className='bg-yellow-100 rounded-lg'>Medium Priority</option>
              <option value="high" className='bg-red-100 rounded-lg'>High Priority</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {sortedTasks.map(task => (
          <div
            key={task.id}
            className={`flex items-start p-3 rounded-lg ${
              task.completed ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <button
              className={`mr-3 mt-1 w-5 h-5 flex items-center justify-center rounded-full border ${
                task.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300'
              }`}
              onClick={() => toggleTaskCompletion(task.id)}
              disabled={loading}
            >
              {task.completed && <FaCheckCircle size={12} />}
            </button>
            <div className="flex-1">
              <div className="flex justify-between">
                <span className={`font-medium ${
                  task.completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={loading}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span>Due: {formatDate(task.dueDate)}</span> •
                <span> Subject: {task.subject}</span>
              </div>
            </div>
          </div>
        ))}

        {taskList.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No tasks yet. Add your first task!
          </div>
        )}
        
        {taskList.length > 5 && (
          <div className="text-center py-2 text-sm text-gray-500">
            Showing 5 of {taskList.length} tasks. Scroll to see more.
          </div>
        )}
      </div>
    </div>
  );
}