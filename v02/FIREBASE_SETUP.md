# Firebase Setup Guide for Chat App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or select an existing one
3. Enter project name (e.g., "chat-app")
4. Click **"Create project"**

## Step 2: Enable Realtime Database

1. In Firebase Console, go to **Build** → **Realtime Database**
2. Click **"Create Database"**
3. Choose location (e.g., Europe-west1)
4. Choose security rules: **Start in test mode** (for development)
5. Click **"Enable"**

## Step 3: Get Service Account Credentials

1. Go to **Project Settings** (⚙️ icon, top-right)
2. Click **"Service Accounts"** tab
3. Click **"Generate New Private Key"**
4. A JSON file will download - save it as `serviceAccountKey.json`

## Step 4: Add the Key to Your App

1. Copy the downloaded JSON file to: `v02/serviceAccountKey.json`
2. Restart the server: `npm start`
3. The app will automatically connect to Firebase!

## Step 5: Set Up Database Rules (Important!)

In Firebase Console → Realtime Database → Rules tab, replace with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": true,
        ".write": "$uid === auth.uid"
      }
    },
    "userchats": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "root.child('chats').child($chatId).child('participants').child(auth.uid).exists()",
        ".write": "root.child('chats').child($chatId).child('participants').child(auth.uid).exists()"
      }
    }
  }
}
```

Then click **"Publish"**

## Step 6: Update Server Configuration (Optional)

The database URL should be in format: `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com`

You can change it in `v02/server.js` if needed:

```javascript
databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
```

## Done! ✅

Your app will now:
- Authenticate users with Firebase
- Store messages in Firebase Realtime Database
- Sync data across all connected clients
- Persist data permanently

---

**Questions?**
- Firebase docs: https://firebase.google.com/docs/database
- Liquid template docs: https://liquidjs.com/
