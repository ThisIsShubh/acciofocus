// Task List UI component
import React from "react";
import { FaPlus, FaCheck, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

export default function TaskList({
    tasks, newTask, editIdx, editText,
    setNewTask, handleAddTask, handleToggleTask, handleDeleteTask, handleEditTask, handleSaveEdit, handleCancelEdit
}) {
    return (
        <>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }}
                    placeholder="Add a new task..."
                    className="flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
                    onClick={handleAddTask}
                >
                    <FaPlus />
                </button>
            </div>
            <ul className="flex-1 flex flex-col gap-2">
                {tasks.length === 0 && (
                    <li className="text-gray-400 italic text-center">No tasks yet.</li>
                )}
                {tasks.map((task, idx) => (
                    <li key={idx} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${task.done ? 'bg-green-100 line-through text-green-700' : 'bg-white'}`}>
                        <button
                            className={`p-1 rounded-full border ${task.done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                            onClick={() => handleToggleTask(idx)}
                        >
                            <FaCheck />
                        </button>
                        {editIdx === idx ? (
                            <>
                                <input
                                    className="flex-1 px-2 py-1 rounded border border-green-300"
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(idx); if (e.key === 'Escape') handleCancelEdit(); }}
                                    autoFocus
                                />
                                <button className="p-1 text-green-600" onClick={() => handleSaveEdit(idx)}><FaCheck /></button>
                                <button className="p-1 text-gray-400" onClick={handleCancelEdit}><FaTimes /></button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1 cursor-pointer" onDoubleClick={() => handleEditTask(idx)}>{task.text}</span>
                                <button className="p-1 text-blue-500" onClick={() => handleEditTask(idx)}><FaEdit /></button>
                                <button className="p-1 text-red-500" onClick={() => handleDeleteTask(idx)}><FaTrash /></button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
}
