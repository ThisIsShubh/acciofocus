// app/study/room/page.js
'use client';
import React, { useState, useEffect } from 'react';
import {
    FaUsers, FaPlus, FaSearch, FaFilter, FaEye, FaEyeSlash,
    FaLock, FaUnlock, FaCrown, FaStar, FaCalendarAlt, FaClock,
    FaUserFriends, FaChartLine, FaDoorOpen, FaEdit, FaTrash,
    FaShare, FaCopy, FaHeart, FaFire, FaBookmark, FaTimes,
    FaCheck, FaExclamationTriangle, FaSpinner, FaEllipsisV, FaCheckCircle,
} from 'react-icons/fa';
import Navbar from '@/components/navbar';
import PageLoader from '@/components/Loader';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StudyRoomsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const filters = [
        { name: 'All Rooms', value: 'all' },
        { name: 'Favorites', value: 'favorites' },
        { name: 'Private', value: 'private' },
        { name: 'Public', value: 'public' },
        { name: 'Active', value: 'active' },
    ]

    const sortOptions = [
        { name: 'Recent', value: 'recent' },
        { name: 'Name', value: 'name' },
        { name: 'Participants', value: 'participants' },
    ]

    // Room states
    const [myRooms, setMyRooms] = useState([]);
    const [publicRooms, setPublicRooms] = useState([]);
    const [activeTab, setActiveTab] = useState('my-rooms');

    // UI states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    // Create room states
    const [newRoom, setNewRoom] = useState({
        name: '',
        description: '',
        isPrivate: false,
        maxParticipants: 10,
        category: 'General'
    });
    const [createLoading, setCreateLoading] = useState(false);

    // Join room states
    const [joinRoomKey, setJoinRoomKey] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
        fetchPublicRooms();
    }, []);

    const fetchUserData = async () => {
        try {
            const res = await fetch('/api/user/me');
            if (!res.ok) throw new Error('Failed to fetch user data');
            const data = await res.json();
            setUser(data);
            setMyRooms(data.studyRooms || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPublicRooms = async () => {
        try {
            const res = await fetch('/api/rooms/pblic');
            if (res.ok) {
                const data = await res.json();
                setPublicRooms(data.rooms || []);
            }
        } catch (error) {
            console.error('Failed to fetch public rooms:', error);
        }
    };

    const createRoom = async () => {
        if (!newRoom.name.trim()) return;

        setCreateLoading(true);
        try {
            const res = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoom)
            });

            if (!res.ok) throw new Error('Failed to create room');

            const data = await res.json();
            setMyRooms(prev => [data.room, ...prev]);
            setShowCreateModal(false);
            setNewRoom({
                name: '',
                description: '',
                isPrivate: false,
                maxParticipants: 10,
                category: 'General'
            });
        } catch (error) {
            setError(error.message);
        } finally {
            setCreateLoading(false);
        }
    };

    const joinRoom = async (roomId, privateKey = null) => {
        setJoinLoading(true);
        try {
            const body = { roomId };
            if (privateKey) body.privateKey = privateKey;

            const res = await fetch('/api/rooms/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Failed to join room');

            const data = await res.json();
            setMyRooms(prev => [data.room, ...prev]);
            setShowJoinModal(false);
            setJoinRoomKey('');
        } catch (error) {
            setError(error.message);
        } finally {
            setJoinLoading(false);
        }
    };

    const toggleFavorite = async (roomId) => {
        try {
            const res = await fetch(`/api/rooms/${roomId}/favorite`, {
                method: 'PATCH'
            });

            if (res.ok) {
                setMyRooms(prev => prev.map(room =>
                    room.id === roomId ? { ...room, favorite: !room.favorite } : room
                ));
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const leaveRoom = async (roomId) => {
        if (!confirm('Are you sure you want to leave this room?')) return;

        try {
            const res = await fetch(`/api/rooms/${roomId}/leave`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setMyRooms(prev => prev.filter(room => room.id !== roomId));
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const copyRoomKey = (roomKey) => {
        navigator.clipboard.writeText(roomKey);
        // You could add a toast notification here
    };


    // Filter and sort rooms
    const filterRooms = (rooms) => {
        let filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterBy !== 'all') {
            filtered = filtered.filter(room => {
                switch (filterBy) {
                    case 'private': return room.isPrivate;
                    case 'public': return !room.isPrivate;
                    case 'favorites': return room.favorite;
                    case 'active': return room.participants > 0;
                    default: return true;
                }
            });
        }

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'participants': return b.participants - a.participants;
                case 'recent': return new Date(b.lastActive) - new Date(a.lastActive);
                default: return 0;
            }
        });
    };

    if (loading) return (
        <PageLoader
            message="Loading study rooms..."
            className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50"
        />
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="text-red-500 text-6xl mb-4">⚠</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Rooms</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    // Filter out rooms the user has already joined from publicRooms for discover tab
    const joinedRoomIds = new Set(myRooms.map(r => r.id));
    const discoverRooms = publicRooms.filter(room => !joinedRoomIds.has(room.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-18 pb-12">

                {/* Hero section */}
                <section
                    className="w-full h-[40vh] p-8 bg-black flex flex-col md:flex-row items-center justify-center gap-8 relative  rounded-2xl shadow-lg"
                    style={{
                        backgroundImage: 'url(/5.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '340px',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30 bg-opacity-50 z-0 rounded-2xl" />

                    <div className="w-full z-10 p-0 md:p-8 ">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">Study<span className="text-green-500"> Rooms</span></h1>
                                <p className="text-white text-lg">Join or create study rooms to collaborate with others</p>
                            </div>

                            <div className="flex gap-3 mt-4 lg:mt-0">
                                <button
                                    onClick={() => setShowJoinModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-transparent bg-green-500/20 backdrop-blur-xl text-white rounded-lg hover:border-green-500 transition-colors"
                                >
                                    <FaDoorOpen /> Join Room
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <FaPlus /> Create Room
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="">
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                                {/* Search Box */}
                                <div className="relative flex-1">
                                    <FaSearch className="z-5 absolute top-1/2 right-4 -translate-y-1/2 text-white pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search rooms..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 !bg-white/20 !backdrop-blur-lg border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm !text-white !placeholder-white/70"
                                    />
                                </div>

                                {/* Filter and Sort Controls */}
                                <div className="flex h-full gap-3">
                                    <Listbox value={filterBy} onChange={setFilterBy}>
                                        <div className="relative h-full">
                                            <ListboxButton className="relative min-w-[120px] w-full h-full cursor-default rounded-lg bg-white border border-gray-300 py-2 pl-4 pr-10 text-left shadow-sm text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500">
                                                {filters.find(f => f.value === filterBy)?.name}
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <FaFilter className="h-4 w-4 text-gray-400" />
                                                </span>
                                            </ListboxButton>
                                            <ListboxOptions className="absolute mt-1 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                {filters.map((filter) => (
                                                    <ListboxOption
                                                        key={filter.value}
                                                        value={filter.value}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-2 pl-4 pr-10 ${active ? 'bg-green-100 text-green-900' : 'text-gray-700'
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                    {filter.name}
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-600">
                                                                        <FaCheckCircle className="h-4 w-4" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </div>
                                    </Listbox>

                                    <Listbox value={sortBy} onChange={setSortBy}>
                                        <div className="relative">
                                            <ListboxButton className="relative h-full w-full min-w-[120px] text-black cursor-default rounded-lg bg-white border border-gray-300 py-2 pl-4 pr-10 text-left shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                                {sortOptions.find(f => f.value === sortBy)?.name}
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <FaFilter className="h-4 w-4 text-black" />
                                                </span>
                                            </ListboxButton>
                                            <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                {sortOptions.map((option) => (
                                                    <ListboxOption
                                                        key={option.value}
                                                        value={option.value}
                                                        className={({ active }) =>
                                                            `relative cursor-pointer select-none py-2 pl-4 pr-10 ${active ? 'bg-green-100 text-green-900' : 'text-gray-700'
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                    {option.name}
                                                                </span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-600">
                                                                        <FaCheckCircle className="h-4 w-4" />
                                                                    </span>
                                                                ) : null}
                                                            </>
                                                        )}
                                                    </ListboxOption>
                                                ))}
                                            </ListboxOptions>
                                        </div>
                                    </Listbox>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Tabs */}
                <div className="flex justify-center m-8">
                    <div className="flex bg-green-100 rounded-full shadow-inner p-1 gap-1">
                        <button
                            className={`px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'my-rooms'
                                    ? 'bg-green-500 text-white shadow'
                                    : 'text-gray-600 hover:bg-green-100'
                                }`}
                            onClick={() => setActiveTab('my-rooms')}
                        >
                            My Rooms ({myRooms.length})
                        </button>
                        <button
                            className={`px-6 py-2 font-semibold rounded-full transition-all duration-150 text-sm ${activeTab === 'discover'
                                    ? 'bg-green-500 text-white shadow'
                                    : 'text-gray-600 hover:bg-green-100'
                                }`}
                            onClick={() => setActiveTab('discover')}
                        >
                            Discover ({discoverRooms.length})
                        </button>
                    </div>
                </div>

                {/* Room Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === 'my-rooms'
                        ? filterRooms(myRooms).map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                isMyRoom={true}
                                onToggleFavorite={() => toggleFavorite(room.id)}
                                onLeave={() => leaveRoom(room.id)}
                                onCopyKey={() => copyRoomKey(room.privateKey)}
                            />
                        ))
                        : filterRooms(discoverRooms).map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                isMyRoom={false}
                                onJoin={() => joinRoom(room.id)}
                            />
                        ))
                    }
                </div>

                {/* Empty State */}
{((activeTab === 'my-rooms' && filterRooms(myRooms).length === 0) ||
  (activeTab === 'discover' && filterRooms(discoverRooms).length === 0)) && (
    <div className="flex flex-col items-center justify-center px-4 max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
          <img src="/16.png" alt="Empty State" className="w-40 h-40" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-sm">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <FaPlus className="text-green-500 text-xs" />
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        {activeTab === 'my-rooms' 
          ? 'You have not joined any rooms yet' 
          : 'No public rooms available'}
      </h3>
      <p className="text-gray-500 text-center mb-8 max-w-sm">
        {activeTab === 'my-rooms'
          ? 'Start collaborating by creating your own room or discovering existing ones.'
          : 'Be the pioneer! Create the first public room in your community.'
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none"
        >
          <FaPlus /> Create Your First Room
        </button>
        {activeTab === 'my-rooms' && (
          <button
            onClick={() => setActiveTab('discover')}
            className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md flex-1 sm:flex-none"
          >
            Discover Rooms
          </button>
        )}
      </div>
    </div>
)}
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <CreateRoomModal
                    newRoom={newRoom}
                    setNewRoom={setNewRoom}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={createRoom}
                    loading={createLoading}
                />
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <JoinRoomModal
                    roomKey={joinRoomKey}
                    setRoomKey={setJoinRoomKey}
                    onClose={() => setShowJoinModal(false)}
                    onJoin={() => joinRoom(null, joinRoomKey)}
                    loading={joinLoading}
                />
            )}
        </div>
    );
}

// Room Card Component
function RoomCard({ room, isMyRoom, onToggleFavorite, onLeave, onJoin, onCopyKey }) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 ${room.favorite ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-white' : 'border-transparent'
            }`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{room.name}</h3>
                    {room.isPrivate && <FaLock className="text-gray-500 text-sm" />}
                    {room.favorite && <FaStar className="text-yellow-500" />}
                </div>

                {isMyRoom && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaEllipsisV className="text-gray-400" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                <button
                                    onClick={() => { onToggleFavorite(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    {room.favorite ? <FaHeart className="text-red-500" /> : <FaBookmark />}
                                    {room.favorite ? 'Remove Favorite' : 'Add to Favorites'}
                                </button>

                                {room.isPrivate && (
                                    <button
                                        onClick={() => { onCopyKey(); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <FaCopy /> Copy Room Key
                                    </button>
                                )}

                                <button
                                    onClick={() => { onLeave(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                >
                                    <FaTrash /> Leave Room
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Description */}
            {room.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center text-blue-500 mb-1">
                        <FaUserFriends />
                    </div>
                    <div className="font-bold text-blue-600">{room.participants}</div>
                    <div className="text-xs text-blue-500">Participants</div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center text-green-500 mb-1">
                        <FaChartLine />
                    </div>
                    <div className="font-bold text-green-600">{room.totalSessions}</div>
                    <div className="text-xs text-green-500">Sessions</div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <FaClock />
                    <span>Active {formatDateTime(room.lastActive)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${room.participants > 0 ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                    <span>{room.participants > 0 ? 'Active' : 'Inactive'}</span>
                </div>
            </div>

            {/* Action Button */}
            {isMyRoom ? (
                <Link className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                key={room.id}
                    href={`/study/room/${room.id}`}>
                    <FaDoorOpen /> Enter Room
                </Link>
            ) : (
                <button
                    onClick={onJoin}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                    <FaPlus /> Join Room
                </button>
            )}
        </div>
    );
}

// Create Room Modal Component
function CreateRoomModal({ newRoom, setNewRoom, onClose, onCreate, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Create Study Room</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Name *
                        </label>
                        <input
                            type="text"
                            value={newRoom.name}
                            onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter room name"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={newRoom.description}
                            onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your study room"
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={newRoom.category}
                            onChange={(e) => setNewRoom(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="General">General</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Science">Science</option>
                            <option value="Language">Language</option>
                            <option value="Programming">Programming</option>
                            <option value="Test Prep">Test Prep</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Participants
                        </label>
                        <input
                            type="number"
                            value={newRoom.maxParticipants}
                            onChange={(e) => setNewRoom(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                            min="2"
                            max="50"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={newRoom.isPrivate}
                            onChange={(e) => setNewRoom(prev => ({ ...prev, isPrivate: e.target.checked }))}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor="isPrivate" className="text-sm text-gray-700 flex items-center gap-2">
                            <FaLock className="text-gray-500" />
                            Make this room private
                        </label>
                    </div>

                    {newRoom.isPrivate && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-yellow-800 text-sm">
                                <FaExclamationTriangle />
                                <span>Private rooms require a key to join. You'll receive a unique key after creation.</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onCreate}
                        disabled={!newRoom.name.trim() || loading}
                        className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                        {loading ? 'Creating...' : 'Create Room'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Join Room Modal Component
function JoinRoomModal({ roomKey, setRoomKey, onClose, onJoin, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Join Private Room</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Key
                    </label>
                    <input
                        type="text"
                        value={roomKey}
                        onChange={(e) => setRoomKey(e.target.value)}
                        placeholder="Enter the private room key"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Ask the room creator for the private key to join
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onJoin}
                        disabled={!roomKey.trim() || loading}
                        className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaDoorOpen />}
                        {loading ? 'Joining...' : 'Join Room'}
                    </button>
                </div>
            </div>
        </div>
    );
}