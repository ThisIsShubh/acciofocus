const mongoose = require('mongoose');

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
  subject: String
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

const StudyRoomSchema = new mongoose.Schema({
  id: String,
  name: String,
  participants: Number,
  lastActive: Date,
  totalSessions: Number,
  favorite: Boolean,
  isPrivate: { type: Boolean, default: false },
  privateKey: { type: String, required: function() { return this.isPrivate; } }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  profile: {
    id: String,
    name: String,
    email: String,
    avatar: String,
    joinDate: Date,
    lastActive: Date,
    streak: Number,
    level: Number,
    xp: Number,
    nextLevelXp: Number,
    bio: String
  },
  stats: {
    totalStudyTime: Number,
    weeklyStudyTime: Number,
    dailyAverage: Number,
    sessionsCompleted: Number,
    focusRate: Number,
    subjects: mongoose.Schema.Types.Mixed,
    productivityTrend: [{ date: Date, minutes: Number }]
  },
  goals: [GoalSchema],
  recentSessions: [SessionSchema],
  tasks: [TaskSchema],
  friends: [FriendSchema],
  achievements: [AchievementSchema],
  studyRooms: [StudyRoomSchema]
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
