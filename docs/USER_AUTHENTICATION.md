# User Authentication & MongoDB Integration

This document explains how user authentication works with Clerk and how users are automatically added to the MongoDB database.

## Overview

The application uses Clerk for authentication and automatically syncs user data to MongoDB for application-specific features like study sessions, goals, achievements, etc.

## Architecture

### 1. Authentication Flow

1. **User Sign Up**: Users can sign up via email/password or OAuth (Google)
2. **Clerk Webhook**: When a user is created in Clerk, a webhook is triggered
3. **MongoDB Sync**: The webhook automatically creates a user record in MongoDB
4. **Application Access**: Users can now access application features with their data

### 2. Key Components

#### Webhook Handler (`app/api/webhook/clerk/route.js`)
- Handles Clerk webhook events
- Creates/updates/deletes users in MongoDB
- Supports multiple event types: `user.created`, `user.updated`, `user.deleted`

#### User Model (`models/User.js`)
- Comprehensive schema for application-specific user data
- Includes profile, stats, goals, sessions, achievements, etc.

#### User Sync Utilities (`helpers/userSync.js`)
- Helper functions for syncing user data
- Functions for getting and updating user data

#### API Endpoints
- `GET /api/user/me` - Get current user's data
- `PUT /api/user/me` - Update user profile

#### React Hook (`controllers/useUser.js`)
- Custom hook for accessing user data in components
- Handles loading states and error handling

## Setup Requirements

### Environment Variables

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string
```

### Clerk Webhook Configuration

1. Go to your Clerk Dashboard
2. Navigate to Webhooks
3. Create a new webhook endpoint: `https://yourdomain.com/api/webhook/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to your environment variables

## Usage Examples

### Using the User Hook in Components

```jsx
import { useUserData } from '@/controllers/useUser';

function Dashboard() {
  const { userData, loading, error, updateUserData } = useUserData();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {userData?.name}!</h1>
      <p>Level: {userData?.level}</p>
      <p>XP: {userData?.xp}/{userData?.nextLevelXp}</p>
      
      <button onClick={() => updateUserData({ bio: 'New bio' })}>
        Update Bio
      </button>
    </div>
  );
}
```

### Manual User Data Fetching

```jsx
import { getUserByClerkId } from '@/helpers/userSync';

// In a server component or API route
const user = await getUserByClerkId(clerkUserId);
```

## User Data Structure

The MongoDB user document includes:

```javascript
{
  profile: {
    id: "clerk_user_id",
    name: "User Name",
    email: "user@example.com",
    avatar: "avatar_url",
    joinDate: Date,
    lastActive: Date,
    streak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    bio: ""
  },
  stats: {
    totalStudyTime: 0,
    weeklyStudyTime: 0,
    dailyAverage: 0,
    sessionsCompleted: 0,
    focusRate: 0,
    subjects: {},
    productivityTrend: []
  },
  goals: [],
  recentSessions: [],
  tasks: [],
  friends: [],
  achievements: [],
  studyRooms: []
}
```

## Error Handling

The system includes comprehensive error handling:

1. **Webhook Verification**: Ensures webhook requests are from Clerk
2. **Database Connection**: Handles MongoDB connection errors
3. **User Not Found**: Gracefully handles missing user data
4. **API Errors**: Returns appropriate HTTP status codes

## Security Considerations

1. **Webhook Verification**: All webhook requests are verified using Clerk's signature
2. **Authentication Required**: User data endpoints require valid Clerk authentication
3. **Field Validation**: Only specific fields can be updated via the API
4. **No Sensitive Data**: Sensitive authentication data stays in Clerk

## Troubleshooting

### Common Issues

1. **User not created in MongoDB**
   - Check webhook configuration in Clerk dashboard
   - Verify webhook secret in environment variables
   - Check server logs for webhook errors

2. **User data not loading**
   - Ensure user is authenticated with Clerk
   - Check MongoDB connection
   - Verify API endpoint is accessible

3. **Webhook verification failed**
   - Verify webhook secret is correct
   - Check that webhook URL is accessible
   - Ensure proper headers are being sent

### Debugging

Enable detailed logging by checking server console output for:
- Webhook event processing
- Database connection status
- User creation/update operations
- API request/response details 