// models/User.js
import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  earned: Boolean,
  dateEarned: Date,
  icon: String
}, { _id: false });

const FriendSchema = new mongoose.Schema({
  id: String,
  name: String,
  avatar: String,
  status: String,
  studying: Boolean,
  currentActivity: String,
  weeklyStudyTime: Number,
  streak: Number
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  id: String,
  title: String,
  dueDate: Date,
  priority: String,
  completed: Boolean,
  subject: String,
  createdAt: Date
}, { _id: false });

const GoalSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  targetHours: Number,
  completedHours: Number,
  deadline: Date,
  status: String,
  category: String
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  id: String,
  date: Date,
  duration: Number,
  subject: String,
  focusScore: Number,
  environment: {
    background: String,
    sounds: [String],
    mode: String,
    roomName: String
  }
}, { _id: false });

// Enhanced StudyRoom Schema with additional fields
const StudyRoomSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  participants: { type: Number, default: 0 },
  maxParticipants: { type: Number, default: 10 },
  lastActive: { type: Date, default: Date.now },
  totalSessions: { type: Number, default: 0 },
  favorite: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  privateKey: { 
    type: String, 
    required: function() { return this.isPrivate; }
  },
  category: { type: String, default: 'General' },
  createdBy: String, // User ID of room creator
  createdAt: { type: Date, default: Date.now },
  members: [String], // Array of user IDs
  settings: {
    allowChat: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: false },
    requirePermissionToJoin: { type: Boolean, default: false },
    studyMode: { 
      type: String, 
      enum: ['pomodoro', 'continuous', 'flexible'], 
      default: 'flexible' 
    },
    sessionLength: { type: Number, default: 25 }, // in minutes
    breakLength: { type: Number, default: 5 } // in minutes
  },
  stats: {
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    averageSessionLength: { type: Number, default: 0 },
    mostActiveDay: String,
    mostStudiedSubject: String
  },
  tags: [String], // For better categorization and search
  currentSession: {
    isActive: { type: Boolean, default: false },
    startTime: Date,
    subject: String,
    participants: [String] // Active participants in current session
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  profile: {
    id: { type: String, unique: true, required: true },
    name: String,
    email: String,
    avatar: String,
    joinDate: Date,
    lastActive: Date,
    streak: Number,
    lastStreakUpdate: Date,
    level: Number,
    xp: Number,
    nextLevelXp: Number,
    bio: String,
    timezone: String, // User's timezone for better session scheduling
    preferences: {
      studyReminders: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      soundNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'en' }
    }
  },
  stats: {
    totalStudyTime: Number,
    weeklyStudyTime: Number,
    dailyAverage: Number,
    sessionsCompleted: Number,
    focusRate: Number,
    subjects: mongoose.Schema.Types.Mixed,
    productivityTrend: [{ date: Date, minutes: Number }],
    roomsCreated: { type: Number, default: 0 },
    roomsJoined: { type: Number, default: 0 },
    collaborativeHours: { type: Number, default: 0 } // Hours studied in rooms
  },
  goals: [GoalSchema],
  recentSessions: [SessionSchema],
  tasks: [TaskSchema],
  friends: [FriendSchema],
  achievements: [AchievementSchema],
  studyRooms: [StudyRoomSchema],
  // Room-related user data
  roomHistory: [{
    roomId: String,
    roomName: String,
    joinedAt: Date,
    leftAt: Date,
    totalTimeSpent: Number, // in minutes
    sessionsCompleted: Number
  }],
  blockedUsers: [String], // Array of user IDs
  roomInvitations: [{
    roomId: String,
    roomName: String,
    invitedBy: String,
    invitedAt: Date,
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better performance
UserSchema.index({ 'profile.email': 1 });
UserSchema.index({ 'profile.id': 1 });
UserSchema.index({ 'studyRooms.id': 1 });
UserSchema.index({ 'studyRooms.isPrivate': 1 });
UserSchema.index({ 'studyRooms.category': 1 });

// Pre-save middleware to update room stats
UserSchema.pre('save', function(next) {
  if (this.isModified('studyRooms')) {
    // Update user stats based on room activity
    const collaborativeHours = this.studyRooms.reduce((total, room) => {
      return total + (room.stats?.totalStudyTime || 0);
    }, 0);
    
    this.stats.collaborativeHours = Math.floor(collaborativeHours / 60); // Convert to hours
    this.stats.roomsJoined = this.studyRooms.length;
  }
  next();
});

// Methods
UserSchema.methods.canJoinRoom = function(room) {
  // Check if user can join a specific room
  if (room.participants >= room.maxParticipants) return false;
  if (room.members && room.members.includes(this.profile.id)) return false;
  return true;
};

UserSchema.methods.isRoomOwner = function(roomId) {
  const room = this.studyRooms.find(r => r.id === roomId);
  return room && room.createdBy === this.profile.id;
};

UserSchema.methods.getRoomStats = function(roomId) {
  const room = this.studyRooms.find(r => r.id === roomId);
  return room ? room.stats : null;
};

// Static methods
UserSchema.statics.findPublicRooms = function(options = {}) {
  const { category, limit = 20, skip = 0 } = options;
  
  return this.aggregate([
    { $unwind: '$studyRooms' },
    { 
      $match: { 
        'studyRooms.isPrivate': false,
        ...(category && { 'studyRooms.category': category })
      }
    },
    { $sort: { 'studyRooms.lastActive': -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        room: '$studyRooms',
        owner: '$profile'
      }
    }
  ]);
};

UserSchema.statics.searchRooms = function(query, options = {}) {
  const { isPrivate, category, limit = 20 } = options;
  
  const matchStage = {
    $or: [
      { 'studyRooms.name': { $regex: query, $options: 'i' } },
      { 'studyRooms.description': { $regex: query, $options: 'i' } },
      { 'studyRooms.tags': { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  if (isPrivate !== undefined) matchStage['studyRooms.isPrivate'] = isPrivate;
  if (category) matchStage['studyRooms.category'] = category;
  
  return this.aggregate([
    { $unwind: '$studyRooms' },
    { $match: matchStage },
    { $sort: { 'studyRooms.lastActive': -1 } },
    { $limit: limit },
    {
      $project: {
        room: '$studyRooms',
        owner: '$profile'
      }
    }
  ]);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);