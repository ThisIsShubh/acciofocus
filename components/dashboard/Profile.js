"use client";
import React, { useState } from 'react';
import { FaFire, FaEdit, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { getFormattedLastActiveDate } from '@/helpers/format';

const Profile = ({ profile, onEditBio = () => {} }) => {
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(profile?.bio || '');

  const handleSaveBio = async () => {
    if (newBio.trim()) {
      try {
        const response = await fetch('/api/bio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: profile?.id, bio: newBio.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          onEditBio(data.bio);
        }
      } finally {
        setEditingBio(false);
      }
    }
  };

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-16 w-16"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white">
      <div className="flex gap-4 items-start">
        {/* Avatar with Level Badge */}
        <div className="relative flex-shrink-0">
          <div className="relative">
            <img
              src={profile?.avatar || '/default-avatar.png'}
              alt="avatar"
              className="w-16 h-16 rounded-full border-2 border-green-500 shadow-md"
            />
          </div>
                    {/* Last Active */}
          <div className="flex flex-col mt-2 text-right">
            <span className='text-xs text-gray-500'>Last Active</span>
            <span className="text-xs text-gray-500">
            {getFormattedLastActiveDate(profile?.lastActive)}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {profile?.name}
            </h1>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                <FaFire className="text-xs" />
                <span>{profile?.streak}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
                <FaStar className="text-xs" />
                <span>{profile?.xp}</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level Progress</span>
              <span>{profile.nextLevelXp - profile.xp} XP needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (profile.xp / profile.nextLevelXp) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-3 relative">
            {editingBio ? (
              <div>
                <textarea
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="What motivates you today?"
                  className="w-full p-3 text-sm border border-blue-200 rounded-xl focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-h-[80px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setEditingBio(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBio}
                    className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : profile?.bio ? (
              <div 
                className="relative bg-blue-50 rounded-lg p-3 text-gray-700 text-sm cursor-pointer hover:bg-blue-100 transition group"
                onClick={() => setEditingBio(true)}
              >
                <FaQuoteLeft className="text-blue-200 absolute top-3 left-3 text-lg" />
                <div className="pl-6 pr-4 py-1 italic">
                  {profile.bio}
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaEdit className="text-blue-400 text-xs" />
                </div>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-300 cursor-pointer transition"
                onClick={() => setEditingBio(true)}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mb-1">
                    <FaEdit className="text-blue-500" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Add your motivation</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;