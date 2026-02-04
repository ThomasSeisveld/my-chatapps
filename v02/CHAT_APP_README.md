# Chat App - Node.js / Express / Liquid / Firebase

This is a chat application built with Node.js, Express, Liquid templates, and Firebase Realtime Database. It's a server-side rendered version of the React chat app from v01.

## Features

- User registration and authentication
- Real-time chat between users
- User list with online status
- Chat history
- Responsive design
- Firebase Realtime Database integration

## Requirements

- Node.js 14+
- Firebase Admin SDK credentials (optional - works in demo mode without it)

## Installation

```bash
npm install
```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project (mijnreactchat)
3. Go to Project Settings → Service Accounts
4. Generate a new private key and download the JSON file
5. Rename it to `serviceAccountKey.json` and place it in the root directory

Or copy the example file and fill in your credentials:
```bash
cp serviceAccountKey.example.json serviceAccountKey.json
```

## Running the Server

```bash
npm start
```

The application will start on `http://localhost:8000`

## Project Structure

```
v02/
├── server.js                  # Express server with Firebase integration
├── package.json              # Dependencies
├── serviceAccountKey.json    # Firebase credentials (create this)
├── public/
│   └── style.css            # Chat styling
├── views/
│   ├── login.liquid         # Login/Register page
│   └── chat.liquid          # Chat interface
└── docs/                    # Documentation
```

## Routes

- `GET /` - Home (redirects to login or chat)
- `GET /login` - Login/Register page
- `POST /auth` - Authentication (login/register)
- `GET /chat` - Chat interface (protected)
- `POST /message` - Send a message
- `GET /messages` - Get messages for a chat
- `POST /logout` - Logout

## Database Structure (Firebase Realtime Database)

```
users/
  {userId}/
    id: string
    username: string
    email: string
    avatar: string
    createdAt: timestamp

userchats/
  {userId}/
    chats:
      - chatId: string
        participants: [userId1, userId2]
        createdAt: timestamp

chats/
  {chatId}/
    messages/
      {messageId}/
        id: string
        senderId: string
        text: string
        createdAt: timestamp
```

## Technology Stack

- **Backend**: Node.js + Express.js
- **Templating**: Liquid (liquidjs)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Frontend**: HTML, CSS, JavaScript (vanilla)

## Features Comparison with React Version (v01)

| Feature | v01 React | v02 Express/Liquid |
|---------|-----------|-------------------|
| Registration | ✅ | ✅ |
| Login | ✅ | ✅ |
| Real-time Chat | ✅ (Firebase listeners) | ✅ (polling every 2s) |
| User List | ✅ | ✅ |
| Chat History | ✅ | ✅ |
| Firebase Integration | ✅ (Client-side SDK) | ✅ (Admin SDK) |
| Image Upload | ✅ | ⏳ (can be added) |
| Emoji Picker | ✅ | ⏳ (can be added) |
| Block Users | ✅ | ⏳ (can be added) |

## Configuration

The app uses the following Firebase project:
- **Project ID**: mijnreactchat
- **Database URL**: https://mijnreactchat-default-rtdb.firebaseio.com

## Notes

- User passwords are managed by Firebase Authentication
- Sessions are stored in-memory (use Redis in production)
- Cookies are used for session management
- The app works in demo mode without Firebase credentials (data stored in memory)

## Development

The app auto-refreshes chat messages every 2 seconds. For production, consider:
- Using WebSockets for real-time updates
- Implementing message pagination
- Adding typing indicators
- Implementing read receipts
- Adding user presence/online status
