// data/userData.js
export const userData = {
  profile: {
    id: "user_12345",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/avatars/user1.jpg",
    joinDate: "2023-01-15",
    lastActive: "2024-05-20T14:30:00Z",
    streak: 42,
    level: 7,
    xp: 1250,
    nextLevelXp: 1500,
    bio: "Computer Science student passionate about productivity tools and focused study sessions."
  },
  
  stats: {
    totalStudyTime: 12500, // in minutes
    weeklyStudyTime: 840,
    dailyAverage: 120,
    sessionsCompleted: 178,
    focusRate: 87, // percentage
    subjects: {
      "Computer Science": 4200,
      "Mathematics": 3200,
      "Physics": 2100,
      "Literature": 1500,
      "Language Learning": 1500
    },
    productivityTrend: [
      { date: "2024-05-14", minutes: 110 },
      { date: "2024-05-15", minutes: 130 },
      { date: "2024-05-16", minutes: 90 },
      { date: "2024-05-17", minutes: 160 },
      { date: "2024-05-18", minutes: 75 },
      { date: "2024-05-19", minutes: 140 },
      { date: "2024-05-20", minutes: 135 }
    ]
  },
  
  goals: [
    {
      id: "goal_1",
      title: "Complete Algorithms Course",
      description: "Finish all modules and assignments",
      targetHours: 50,
      completedHours: 32,
      deadline: "2024-06-30",
      status: "in-progress",
      category: "Computer Science"
    },
    {
      id: "goal_2",
      title: "Daily 2-hour Study Streak",
      description: "Study at least 2 hours every day for 30 days",
      targetHours: 60,
      completedHours: 42,
      deadline: "2024-06-15",
      status: "in-progress",
      category: "General"
    },
    {
      id: "goal_3",
      title: "Learn Spanish Basics",
      description: "Complete beginner Spanish course",
      targetHours: 20,
      completedHours: 15,
      deadline: "2024-07-10",
      status: "in-progress",
      category: "Language Learning"
    },
    {
      id: "goal_4",
      title: "Master Calculus Concepts",
      description: "Complete all calculus practice problems",
      targetHours: 40,
      completedHours: 40,
      deadline: "2024-05-10",
      status: "completed",
      category: "Mathematics"
    }
  ],
  
  recentSessions: [
    {
      id: "session_789",
      date: "2024-05-20T14:00:00Z",
      duration: 125,
      subject: "Computer Science",
      focusScore: 92,
      environment: {
        background: "forest",
        sounds: ["rain", "cafe"],
        mode: "solo"
      }
    },
    {
      id: "session_788",
      date: "2024-05-19T19:30:00Z",
      duration: 90,
      subject: "Mathematics",
      focusScore: 85,
      environment: {
        background: "library",
        sounds: ["white-noise"],
        mode: "group",
        roomName: "Math Study Group"
      }
    },
    {
      id: "session_787",
      date: "2024-05-18T10:15:00Z",
      duration: 140,
      subject: "Physics",
      focusScore: 88,
      environment: {
        background: "minimal",
        sounds: ["forest"],
        mode: "solo"
      }
    },
    {
      id: "session_786",
      date: "2024-05-17T16:45:00Z",
      duration: 110,
      subject: "Language Learning",
      focusScore: 79,
      environment: {
        background: "cafe",
        sounds: ["cafe"],
        mode: "solo"
      }
    }
  ],
  
  tasks: [
    {
      id: "task_1",
      title: "Complete sorting algorithms assignment",
      dueDate: "2024-05-22",
      priority: "high",
      completed: false,
      subject: "Computer Science"
    },
    {
      id: "task_2",
      title: "Review calculus derivatives chapter",
      dueDate: "2024-05-23",
      priority: "medium",
      completed: false,
      subject: "Mathematics"
    },
    {
      id: "task_3",
      title: "Prepare for physics exam",
      dueDate: "2024-05-25",
      priority: "high",
      completed: false,
      subject: "Physics"
    },
    {
      id: "task_4",
      title: "Spanish vocabulary practice",
      dueDate: "2024-05-21",
      priority: "low",
      completed: true,
      subject: "Language Learning"
    }
  ],
  
  friends: [
    {
      id: "user_67890",
      name: "Sarah Chen",
      avatar: "/avatars/user2.jpg",
      status: "online",
      studying: true,
      currentActivity: "Studying Mathematics",
      weeklyStudyTime: 720,
      streak: 35
    },
    {
      id: "user_54321",
      name: "Michael Rodriguez",
      avatar: "/avatars/user3.jpg",
      status: "online",
      studying: false,
      currentActivity: "Taking a break",
      weeklyStudyTime: 680,
      streak: 28
    },
    {
      id: "user_09876",
      name: "Emma Wilson",
      avatar: "/avatars/user4.jpg",
      status: "offline",
      studying: false,
      currentActivity: "Last active 2 hours ago",
      weeklyStudyTime: 920,
      streak: 56
    },
    {
      id: "user_13579",
      name: "David Kim",
      avatar: "/avatars/user5.jpg",
      status: "online",
      studying: true,
      currentActivity: "Studying Computer Science",
      weeklyStudyTime: 810,
      streak: 41
    }
  ],
  
  achievements: [
    {
      id: "ach_1",
      title: "Study Streak Starter",
      description: "Maintain a 7-day study streak",
      earned: true,
      dateEarned: "2023-02-10",
      icon: "🔥"
    },
    {
      id: "ach_2",
      title: "Focused Learner",
      description: "Achieve 90%+ focus score in 10 sessions",
      earned: true,
      dateEarned: "2023-03-15",
      icon: "🎯"
    },
    {
      id: "ach_3",
      title: "Night Owl",
      description: "Study after 10 PM for 5 consecutive days",
      earned: false,
      icon: "🦉"
    },
    {
      id: "ach_4",
      title: "Social Scholar",
      description: "Participate in 10 group study sessions",
      earned: true,
      dateEarned: "2024-01-22",
      icon: "👥"
    },
    {
      id: "ach_5",
      title: "Century Club",
      description: "Reach 100 total study hours",
      earned: true,
      dateEarned: "2023-05-18",
      icon: "💯"
    },
    {
      id: "ach_6",
      title: "Subject Master",
      description: "Complete 50 hours in a single subject",
      earned: false,
      icon: "📚"
    }
  ],
  
  studyRooms: [
    {
      id: "room_123",
      name: "Computer Science Study Group",
      participants: 8,
      lastActive: "2024-05-19T21:30:00Z",
      totalSessions: 15,
      favorite: true
    },
    {
      id: "room_456",
      name: "Late Night Study Crew",
      participants: 5,
      lastActive: "2024-05-18T23:45:00Z",
      totalSessions: 8,
      favorite: true
    },
    {
      id: "room_789",
      name: "Mathematics Problem Solvers",
      participants: 12,
      lastActive: "2024-05-17T18:20:00Z",
      totalSessions: 22,
      favorite: false
    },
    {
      id: "room_101",
      name: "Language Exchange",
      participants: 6,
      lastActive: "2024-05-15T15:10:00Z",
      totalSessions: 5,
      favorite: false
    }
  ]
};

// Additional helper data
export const subjects = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Literature",
  "Language Learning",
  "Biology",
  "Chemistry",
  "History",
  "Art",
  "Music"
];

export const backgrounds = [
  { id: "forest", name: "Forest", type: "image" },
  { id: "library", name: "Library", type: "image" },
  { id: "cafe", name: "Cafe", type: "image" },
  { id: "minimal", name: "Minimal", type: "image" },
  { id: "space", name: "Space", type: "video" },
  { id: "rain", name: "Rain", type: "video" },
  { id: "fireplace", name: "Fireplace", type: "video" }
];

export const ambientSounds = [
  { id: "rain", name: "Rainfall" },
  { id: "cafe", name: "Coffee Shop" },
  { id: "forest", name: "Forest" },
  { id: "waves", name: "Ocean Waves" },
  { id: "white-noise", name: "White Noise" },
  { id: "fireplace", name: "Fireplace" },
  { id: "piano", name: "Piano" }
];