// lib/roomUtils.js
import User from '@/models/user';
import { v4 as uuidv4 } from 'uuid';

export class RoomManager {
  /**
   * Generate a unique room key for private rooms
   */
  static generateRoomKey() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Create a new study room
   */
  static async createRoom(userId, roomData) {
    try {
      const user = await User.findOne({ 'profile.id': userId });
      if (!user) throw new Error('User not found');

      const roomId = uuidv4();
      const newRoom = {
        id: roomId,
        name: roomData.name.trim(),
        description: roomData.description?.trim() || '',
        participants: 1,
        maxParticipants: Math.max(2, Math.min(50, roomData.maxParticipants || 10)),
        lastActive: new Date(),
        totalSessions: 0,
        favorite: false,
        isPrivate: Boolean(roomData.isPrivate),
        privateKey: roomData.isPrivate ? this.generateRoomKey() : null,
        category: roomData.category || 'General',
        createdBy: userId,
        createdAt: new Date(),
        members: [userId],
        settings: {
          allowChat: roomData.settings?.allowChat ?? true,
          allowScreenShare: roomData.settings?.allowScreenShare ?? false,
          requirePermissionToJoin: roomData.settings?.requirePermissionToJoin ?? false,
          studyMode: roomData.settings?.studyMode || 'flexible',
          sessionLength: roomData.settings?.sessionLength || 25,
          breakLength: roomData.settings?.breakLength || 5
        },
        stats: {
          totalStudyTime: 0,
          averageSessionLength: 0,
          mostActiveDay: null,
          mostStudiedSubject: null
        },
        tags: roomData.tags || [],
        currentSession: {
          isActive: false,
          startTime: null,
          subject: null,
          participants: []
        }
      };

      user.studyRooms = user.studyRooms || [];
      user.studyRooms.unshift(newRoom);
      user.stats.roomsCreated = (user.stats.roomsCreated || 0) + 1;

      await user.save();
      return newRoom;
    } catch (error) {
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  /**
   * Join a room by ID or private key
   */
  static async joinRoom(userId, { roomId, privateKey }) {
    try {
      const currentUser = await User.findOne({ 'profile.id': userId });
      if (!currentUser) throw new Error('User not found');

      // Check if already in room
      const existingRoom = currentUser.studyRooms?.find(room => room.id === roomId);
      if (existingRoom) throw new Error('Already joined this room');

      let roomToJoin = null;
      let roomOwnerUser = null;

      if (roomId) {
        // Find public room by ID
        const users = await User.find({ 'studyRooms.id': roomId });
        for (const user of users) {
          const room = user.studyRooms.find(r => r.id === roomId && !r.isPrivate);
          if (room) {
            roomToJoin = room;
            roomOwnerUser = user;
            break;
          }
        }
      } else if (privateKey) {
        // Find room by private key
        const users = await User.find({ 'studyRooms.privateKey': privateKey });
        for (const user of users) {
          const room = user.studyRooms.find(r => r.privateKey === privateKey);
          if (room) {
            roomToJoin = room;
            roomOwnerUser = user;
            break;
          }
        }
      }

      if (!roomToJoin) throw new Error('Room not found or invalid key');
      if (roomToJoin.participants >= roomToJoin.maxParticipants) {
        throw new Error('Room is full');
      }

      // Update room in all members
      await this.updateRoomInAllMembers(roomToJoin.id, {
        participants: roomToJoin.participants + 1,
        lastActive: new Date(),
        members: [...(roomToJoin.members || []), userId]
      });

      // Add room to current user
      const userRoom = { ...roomToJoin, favorite: false };
      currentUser.studyRooms.unshift(userRoom);
      await currentUser.save();

      return userRoom;
    } catch (error) {
      throw new Error(`Failed to join room: ${error.message}`);
    }
  }

  /**
   * Leave a room
   */
  static async leaveRoom(userId, roomId) {
    try {
      const user = await User.findOne({ 'profile.id': userId });
      if (!user) throw new Error('User not found');

      const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
      if (roomIndex === -1) throw new Error('Room not found');

      const room = user.studyRooms[roomIndex];
      
      // Add to room history before leaving
      user.roomHistory = user.roomHistory || [];
      const historyEntry = user.roomHistory.find(h => h.roomId === roomId && !h.leftAt);
      if (historyEntry) {
        historyEntry.leftAt = new Date();
      } else {
        user.roomHistory.push({
          roomId: roomId,
          roomName: room.name,
          joinedAt: room.createdAt,
          leftAt: new Date(),
          totalTimeSpent: room.stats?.totalStudyTime || 0,
          sessionsCompleted: room.totalSessions || 0
        });
      }

      // Remove room from user
      user.studyRooms.splice(roomIndex, 1);

      // Update room in all other members
      await this.updateRoomInAllMembers(roomId, {
        participants: Math.max(0, room.participants - 1),
        lastActive: new Date(),
        members: (room.members || []).filter(memberId => memberId !== userId)
      }, userId);

      await user.save();
      return true;
    } catch (error) {
      throw new Error(`Failed to leave room: ${error.message}`);
    }
  }

  /**
   * Update room data across all members
   */
  static async updateRoomInAllMembers(roomId, updates, excludeUserId = null) {
    try {
      const query = { 'studyRooms.id': roomId };
      if (excludeUserId) {
        query['profile.id'] = { $ne: excludeUserId };
      }

      const users = await User.find(query);
      
      const updatePromises = users.map(async (user) => {
        const roomIndex = user.studyRooms.findIndex(r => r.id === roomId);
        if (roomIndex !== -1) {
          Object.keys(updates).forEach(key => {
            user.studyRooms[roomIndex][key] = updates[key];
          });
          return user.save();
        }
      });

      await Promise.all(updatePromises.filter(Boolean));
    } catch (error) {
      console.error('Error updating room in all members:', error);
    }
  }

  /**
   * Start a study session in a room
   */
  static async startSession(userId, roomId, sessionData) {
    try {
      const user = await User.findOne({ 'profile.id': userId });
      if (!user) throw new Error('User not found');

      const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
      if (roomIndex === -1) throw new Error('Room not found');

      const sessionUpdate = {
        'currentSession.isActive': true,
        'currentSession.startTime': new Date(),
        'currentSession.subject': sessionData.subject || 'General Study',
        'currentSession.participants': [userId],
        lastActive: new Date()
      };

      await this.updateRoomInAllMembers(roomId, sessionUpdate);
      return true;
    } catch (error) {
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }

  /**
   * End a study session in a room
   */
  static async endSession(userId, roomId, sessionData) {
    try {
      const user = await User.findOne({ 'profile.id': userId });
      if (!user) throw new Error('User not found');

      const roomIndex = user.studyRooms?.findIndex(room => room.id === roomId);
      if (roomIndex === -1) throw new Error('Room not found');

      const room = user.studyRooms[roomIndex];
      const sessionDuration = sessionData.duration || 0; // in minutes

      // Update room stats
      const newTotalStudyTime = (room.stats?.totalStudyTime || 0) + sessionDuration;
      const newTotalSessions = (room.totalSessions || 0) + 1;
      const newAverageSessionLength = Math.round(newTotalStudyTime / newTotalSessions);

      const sessionUpdate = {
        'currentSession.isActive': false,
        'currentSession.startTime': null,
        'currentSession.subject': null,
        'currentSession.participants': [],
        totalSessions: newTotalSessions,
        'stats.totalStudyTime': newTotalStudyTime,
        'stats.averageSessionLength': newAverageSessionLength,
        lastActive: new Date()
      };

      await this.updateRoomInAllMembers(roomId, sessionUpdate);

      // Add session to user's recent sessions
      const newSession = {
        id: uuidv4(),
        date: new Date(),
        duration: sessionDuration,
        subject: sessionData.subject || 'General Study',
        focusScore: sessionData.focusScore || 0,
        environment: {
          background: sessionData.background || 'default',
          sounds: sessionData.sounds || [],
          mode: 'room',
          roomName: room.name
        }
      };

      user.recentSessions = user.recentSessions || [];
      user.recentSessions.unshift(newSession);
      if (user.recentSessions.length > 50) {
        user.recentSessions = user.recentSessions.slice(0, 50);
      }

      await user.save();
      return newSession;
    } catch (error) {
      throw new Error(`Failed to end session: ${error.message}`);
    }
  }

  /**
   * Get room statistics
   */
  static async getRoomStats(roomId) {
    try {
      const users = await User.find({ 'studyRooms.id': roomId });
      if (users.length === 0) throw new Error('Room not found');

      const room = users[0].studyRooms.find(r => r.id === roomId);
      const members = users.map(user => ({
        id: user.profile.id,
        name: user.profile.name,
        avatar: user.profile.avatar,
        lastActive: user.profile.lastActive,
        streak: user.profile.streak,
        level: user.profile.level
      }));

      const stats = {
        totalMembers: members.length,
        activeMembers: members.filter(m => {
          const lastActive = new Date(m.lastActive);
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return lastActive > dayAgo;
        }).length,
        totalStudyTime: room.stats?.totalStudyTime || 0,
        totalSessions: room.totalSessions || 0,
        averageSessionLength: room.stats?.averageSessionLength || 0,
        createdAt: room.createdAt,
        isCurrentlyActive: room.currentSession?.isActive || false,
        currentParticipants: room.currentSession?.participants?.length || 0
      };

      return { room, members, stats };
    } catch (error) {
      throw new Error(`Failed to get room stats: ${error.message}`);
    }
  }

  /**
   * Search public rooms
   */
  static async searchPublicRooms(query, filters = {}) {
    try {
      const { category, limit = 20, skip = 0, sortBy = 'recent' } = filters;
      
      const matchStage = {
        'studyRooms.isPrivate': false
      };

      if (query) {
        matchStage.$or = [
          { 'studyRooms.name': { $regex: query, $options: 'i' } },
          { 'studyRooms.description': { $regex: query, $options: 'i' } },
          { 'studyRooms.tags': { $in: [new RegExp(query, 'i')] } }
        ];
      }

      if (category && category !== 'all') {
        matchStage['studyRooms.category'] = category;
      }

      let sortStage = {};
      switch (sortBy) {
        case 'name':
          sortStage = { 'studyRooms.name': 1 };
          break;
        case 'participants':
          sortStage = { 'studyRooms.participants': -1 };
          break;
        case 'recent':
        default:
          sortStage = { 'studyRooms.lastActive': -1 };
          break;
      }

      const rooms = await User.aggregate([
        { $unwind: '$studyRooms' },
        { $match: matchStage },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            room: '$studyRooms',
            owner: {
              id: '$profile.id',
              name: '$profile.name',
              avatar: '$profile.avatar'
            }
          }
        }
      ]);

      return rooms;
    } catch (error) {
      throw new Error(`Failed to search rooms: ${error.message}`);
    }
  }

  /**
   * Get trending rooms (most active in last 7 days)
   */
  static async getTrendingRooms(limit = 10) {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const rooms = await User.aggregate([
        { $unwind: '$studyRooms' },
        { 
          $match: { 
            'studyRooms.isPrivate': false,
            'studyRooms.lastActive': { $gte: weekAgo }
          }
        },
        {
          $addFields: {
            activityScore: {
              $add: [
                { $multiply: ['$studyRooms.participants', 2] }, // Weight participants more
                '$studyRooms.totalSessions',
                { $divide: ['$studyRooms.stats.totalStudyTime', 60] } // Hours studied
              ]
            }
          }
        },
        { $sort: { activityScore: -1 } },
        { $limit: limit },
        {
          $project: {
            room: '$studyRooms',
            owner: {
              id: '$profile.id',
              name: '$profile.name',
              avatar: '$profile.avatar'
            },
            activityScore: 1
          }
        }
      ]);

      return rooms;
    } catch (error) {
      throw new Error(`Failed to get trending rooms: ${error.message}`);
    }
  }

  /**
   * Get recommended rooms for a user
   */
  static async getRecommendedRooms(userId, limit = 10) {
    try {
      const user = await User.findOne({ 'profile.id': userId });
      if (!user) throw new Error('User not found');

      // Get user's joined room categories and study subjects
      const userRoomCategories = user.studyRooms?.map(r => r.category) || [];
      const userSubjects = Object.keys(user.stats?.subjects || {});
      
      const matchStage = {
        'studyRooms.isPrivate': false,
        'studyRooms.members': { $ne: userId }, // Not already joined
        $or: []
      };

      // Recommend based on categories
      if (userRoomCategories.length > 0) {
        matchStage.$or.push({
          'studyRooms.category': { $in: userRoomCategories }
        });
      }

      // Recommend based on study subjects
      if (userSubjects.length > 0) {
        matchStage.$or.push({
          'studyRooms.tags': { $in: userSubjects }
        });
      }

      // If no preferences, show popular rooms
      if (matchStage.$or.length === 0) {
        delete matchStage.$or;
      }

      const rooms = await User.aggregate([
        { $unwind: '$studyRooms' },
        { $match: matchStage },
        {
          $addFields: {
            relevanceScore: {
              $add: [
                { $multiply: ['$studyRooms.participants', 1.5] },
                '$studyRooms.totalSessions',
                { $cond: [
                  { $in: ['$studyRooms.category', userRoomCategories] },
                  5, // Bonus for matching category
                  0
                ]}
              ]
            }
          }
        },
        { $sort: { relevanceScore: -1 } },
        { $limit: limit },
        {
          $project: {
            room: '$studyRooms',
            owner: {
              id: '$profile.id',
              name: '$profile.name',
              avatar: '$profile.avatar'
            }
          }
        }
      ]);

      return rooms;
    } catch (error) {
      throw new Error(`Failed to get recommended rooms: ${error.message}`);
    }
  }
}

export default RoomManager;