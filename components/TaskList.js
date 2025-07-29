import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaCheck, FaEdit, FaTrash, FaTimes, FaEllipsisV, FaTasks, FaSpinner, FaChevronDown, FaChevronUp, FaSort } from "react-icons/fa";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TaskList({
  tasks, setTasks, newTask, setNewTask, editIdx, setEditIdx, editText, setEditText
}) {
  const [loading, setLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOption, setSortOption] = useState('creation');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Fetch tasks from database on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        
        // Add frontend creation timestamp for sorting since backend doesn't provide it
        const tasksWithFrontendTimestamp = data.map(task => ({
          ...task,
          frontendCreatedAt: Date.now() // Add current timestamp
        }));
        
        setTasks(tasksWithFrontendTimestamp);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  // Enhanced sorting logic that works without backend creation date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // For dueDate
      if (sortOption === 'dueDate') {
        const aDate = new Date(a.dueDate).getTime();
        const bDate = new Date(b.dueDate).getTime();
        
        return sortDirection === 'asc' 
          ? aDate - bDate 
          : bDate - aDate;
      }
      
      // For priority
      if (sortOption === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        return sortDirection === 'asc' 
          ? aPriority - bPriority 
          : bPriority - aPriority;
      }
      
      // For creation (using frontend timestamp)
      if (sortOption === 'creation') {
        return sortDirection === 'asc' 
          ? a.frontendCreatedAt - b.frontendCreatedAt 
          : b.frontendCreatedAt - a.frontendCreatedAt;
      }
      
      // Default to title sorting
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    });
  }, [tasks, sortOption, sortDirection]);

  // Toggle task completion
  const handleToggleTask = async (taskId) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedStatus = !task.completed;
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, completed: updatedStatus } : t
        ));
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

  // Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create task');
      }

      const createdTask = await response.json();
      
      // Add frontend timestamp for proper sorting
      const taskWithTimestamp = {
        ...createdTask,
        frontendCreatedAt: Date.now()
      };
      
      // Add new task at the top
      setTasks([taskWithTimestamp, ...tasks]);
      setTaskForm({
        title: '',
        subject: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
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

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save edited task
  const handleSaveEdit = async (taskId) => {
    if (!editText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editText.trim() }),
      });

      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, title: editText.trim() } : t
        ));
        setEditIdx(-1);
        setEditText("");
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

  // Handle sorting option selection
  const handleSortSelect = (option) => {
    if (sortOption === option) {
      // Toggle direction if same option selected
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new option with smart default direction
      let defaultDirection = 'desc';
      if (option === 'priority') defaultDirection = 'desc';
      if (option === 'title') defaultDirection = 'asc';
      if (option === 'dueDate') defaultDirection = 'asc';
      
      setSortOption(option);
      setSortDirection(defaultDirection);
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
      creation: 'Creation',
      title: 'Title'
    };
    
    return `${names[sortOption]} ${directions[sortDirection]}`;
  };

  return (
    <div className="flex flex-col h-full mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
          <FaTasks className="text-green-500" /> Tasks
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-green-500 hover:text-green-600 p-1 rounded flex items-center gap-1 text-sm"
          >
            Add Task <FaPlus />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50"
            >
              <FaSort />
            </button>
            
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-xs text-gray-500 font-medium">Sort By</div>
                <button
                  onClick={() => handleSortSelect('creation')}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortOption === 'creation' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Creation
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
                  onClick={() => handleSortSelect('title')}
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    sortOption === 'title' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Title
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

      {/* Collapsible Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 gap-3 mb-3">
            <input
              type="text"
              placeholder="Task title*"
              value={taskForm.title}
              onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
              required
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Subject"
                value={taskForm.subject}
                onChange={(e) => setTaskForm({...taskForm, subject: e.target.value})}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="low" className='bg-green-100'>Low</option>
                <option value="medium" className='bg-yellow-100'>Medium</option>
                <option value="high" className='bg-red-100'>High</option>
              </select>
            </div>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !taskForm.title.trim()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      )}

      {/* Task List */}
      <ul className="flex-1 flex flex-col gap-3">
        {loading ? (
          <li className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-green-500 text-2xl" />
          </li>
        ) : sortedTasks.length === 0 ? (
          <li className="text-gray-400 italic text-center py-4">
            No tasks yet. Add your first task!
          </li>
        ) : (
          sortedTasks.map((task) => (
            <li 
              key={task.id} 
              className={`flex items-start p-3 rounded-xl ${
                task.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
              }`}
            >
              <button
                className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border-2 mr-3 mt-1 ${
                  task.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 text-transparent hover:border-green-400'
                }`}
                onClick={() => handleToggleTask(task.id)}
                disabled={loading}
              >
                <FaCheck size={10} />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className={`font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {editIdx === task.id ? (
                      <input
                        className="flex-1 px-2 py-1 rounded border border-green-300 text-sm w-full"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { 
                          if (e.key === 'Enter') handleSaveEdit(task.id); 
                          if (e.key === 'Escape') setEditIdx(-1);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="truncate"
                        onDoubleClick={() => setEditIdx(task.id)}
                      >
                        {task.title}
                      </span>
                    )}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {editIdx === task.id ? (
                      <>
                        <button 
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          onClick={() => handleSaveEdit(task.id)}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                          onClick={() => setEditIdx(-1)}
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          onClick={() => setEditIdx(task.id)}
                          disabled={loading}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={loading}
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="whitespace-nowrap">Due: {formatDate(task.dueDate)}</span>
                  {task.subject && (
                    <span className="truncate max-w-[100px]">Subject: {task.subject}</span>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}