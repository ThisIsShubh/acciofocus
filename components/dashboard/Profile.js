"use client";
import React, { useState } from 'react';
import { FaFire, FaEdit, FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import { getFormattedDate, getFormattedTime, getFormattedJoinedDate, getFormattedLastActiveDate } from '@/helpers/format';

const Profile = ({ profile, onEditBio = () => {} }) => {
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(profile?.bio || '');

  const handleSaveBio = async () => {
  if (newBio.trim()) {
    try {
      const response = await fetch('/api/bio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile?.id,
          bio: newBio.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onEditBio(data.bio); // Update local state
      } else {
        console.error('Failed to update bio');
      }
    } catch (err) {
      console.error('Error updating bio:', err);
    } finally {
      setEditingBio(false);
    }
  }
};


  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-20 w-20"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={profile?.avatar || '/default-avatar.png'}
              alt="avatar"
              className="w-20 h-20 rounded-full border-4 border-green-500 shadow-lg"
            />
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
              <span className="text-lg font-bold">{profile?.level}</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl text-center shadow">
              <div className="flex items-center justify-center gap-2">
                <FaFire className="text-sm" />
                <span className="font-bold text-sm">{profile?.streak}</span>
              </div>
              <div className="text-xs font-medium">DAY STREAK</div>
            </div>
            
            <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-xl text-center shadow">
              <div className="font-bold text-sm">{profile?.xp}/{profile?.nextLevelXp}</div>
              <div className="text-xs font-medium">XP POINTS</div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{profile?.name}</h1>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span className="font-medium">Level</span>
                <span className="font-bold text-green-600">{profile?.level}</span>
              </div>
            </div>
          </div>
          
          {/* Compact Bio/Motivation Section */}
<div className="mb-4">
  <div className="flex items-center justify-between mb-1">
    <h3 className="text-md font-medium text-gray-700 flex items-center">
      <FaQuoteLeft className="mr-1 text-blue-400 text-sm" />
      <span>Motivation</span>
      <FaQuoteRight className="ml-1 text-blue-400 text-sm" />
    </h3>
    <button 
      onClick={() => setEditingBio(true)}
      className="text-blue-500 hover:text-blue-700 flex items-center text-xs"
    >
      <FaEdit className="mr-0.5" /> Edit
    </button>
  </div>
  
  {editingBio ? (
    <div className="mb-2">
      <textarea
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
        placeholder="What motivates you today?"
        className="w-full p-2 text-sm border border-blue-300 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 min-h-[80px]"
        autoFocus
      />
      <div className="flex justify-end gap-1 mt-1">
        <button 
          onClick={() => setEditingBio(false)}
          className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button 
          onClick={handleSaveBio}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Save
        </button>
      </div>
    </div>
  ) : profile?.bio ? (
    <div 
      className="bg-blue-50 border-l-2 border-blue-400 p-2 rounded-r-lg italic text-gray-700 text-sm cursor-pointer hover:bg-blue-100 transition"
      onClick={() => setEditingBio(true)}
    >
      {profile.bio}
    </div>
  ) : (
    <div 
      className="border border-dashed border-blue-200 rounded-lg p-2 text-center text-gray-500 text-sm hover:bg-blue-50 cursor-pointer transition"
      onClick={() => setEditingBio(true)}
    >
      <div className="flex items-center justify-center gap-1">
        <FaEdit className="text-blue-300 text-sm" />
        <span>Add motivation</span>
      </div>
    </div>
  )}
</div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Level Progress</span>
              <span>{Math.round((profile.xp / profile.nextLevelXp) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full" 
                style={{ width: `${(profile.xp / profile.nextLevelXp) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Info Grid */}
          <div className="flex gap-8 text-sm">
            <div className="">
              <div className="font-medium text-gray-700 mb-1">Last Active</div>
              <div className="font-medium text-green-800">{getFormattedLastActiveDate(profile?.lastActive)}</div>
            </div>
            <div className="">
              <div className="font-medium text-gray-700 mb-1">Email</div>
              <div className="font-medium text-green-800">{profile?.email}</div>
            </div>
            <div className="">
              <div className="font-medium text-gray-700 mb-1">Next Level</div>
              <div className="font-medium text-green-800">{profile.nextLevelXp - profile.xp} XP needed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;