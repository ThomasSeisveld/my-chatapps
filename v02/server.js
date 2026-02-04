// Importeer het npm package Express
import express from 'express'
import { Liquid } from 'liquidjs'
import admin from 'firebase-admin'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express
const app = express()

// Stel Liquid in als 'view engine'
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')
app.set('view engine', 'liquid')

// Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Simple cookie parsing middleware
app.use((req, res, next) => {
  const cookies = {}
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      cookies[name] = value
    })
  }
  req.cookies = cookies
  res.cookie = (name, value, options) => {
    res.setHeader('Set-Cookie', `${name}=${value}; Path=/`)
  }
  res.clearCookie = (name) => {
    res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
  }
  next()
})

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json')
let firebaseInitialized = false
let db = null
let auth = null

try {
  // Try to load from file first (backward compatibility)
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://hva-chatapp-default-rtdb.europe-west1.firebasedatabase.app"
    })
    firebaseInitialized = true
    db = admin.database()
    auth = admin.auth()
    console.log('✓ Firebase initialized from serviceAccountKey.json')
  } 
  // Try to load from environment variables
  else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs'
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://hva-chatapp-default-rtdb.europe-west1.firebasedatabase.app"
    })
    firebaseInitialized = true
    db = admin.database()
    auth = admin.auth()
    console.log('✓ Firebase initialized from environment variables')
  } 
  else {
    console.warn('⚠ Warning: Firebase credentials not found.')
    console.warn('  The app will work in demo mode with limited functionality.')
    console.warn('  Options to enable Firebase:')
    console.warn('    1. Create v02/.env and copy from v02/.env.example')
    console.warn('    2. Or create v02/serviceAccountKey.json')
    firebaseInitialized = false
  }
} catch (err) {
  console.warn('⚠ Firebase initialization warning:', err.message)
  firebaseInitialized = false
}

// Session storage (in-memory)
const sessions = {}
// Demo data storage (when Firebase is not initialized)
const demoData = {
  users: {},
  userchats: {},
  chats: {}
}

const setSession = (sessionId, user) => {
  sessions[sessionId] = user
}

const getSession = (sessionId) => {
  return sessions[sessionId] || null
}

const clearSession = (sessionId) => {
  delete sessions[sessionId]
}

// Routes

// Home redirect
app.get('/', (req, res) => {
  const { sessionId } = req.cookies
  const currentUser = getSession(sessionId)
  
  if (currentUser) {
    res.redirect('/chat')
  } else {
    res.redirect('/login')
  }
})

// Login page
app.get('/login', (req, res) => {
  res.render('login', { error: null })
})

// Register/Login handler
app.post('/auth', async (req, res) => {
  const { action, username, email, password } = req.body

  try {
    if (!firebaseInitialized) {
      // Demo mode
      if (action === 'register') {
        const userId = uuidv4()
        
        if (demoData.users[email]) {
          return res.render('login', { error: 'Gebruiker bestaat al' })
        }

        demoData.users[userId] = {
          id: userId,
          username,
          email,
          avatar: '/default-avatar.png',
          createdAt: new Date().toISOString()
        }
        demoData.users[email] = demoData.users[userId]
        demoData.userchats[userId] = { chats: [] }

        const sessionId = uuidv4()
        setSession(sessionId, demoData.users[userId])
        res.cookie('sessionId', sessionId)
        return res.redirect('/chat')
      }

      if (action === 'login') {
        const user = demoData.users[email]
        if (!user) {
          return res.render('login', { error: 'Ongeldig email of wachtwoord' })
        }

        const sessionId = uuidv4()
        setSession(sessionId, user)
        res.cookie('sessionId', sessionId)
        return res.redirect('/chat')
      }

      return res.render('login', { error: 'Ongeldige actie' })
    }

    // Firebase mode
    if (action === 'register') {
      // Check if user exists
      let userExists = false
      try {
        await auth.getUserByEmail(email)
        userExists = true
      } catch (err) {
        // User doesn't exist, which is good
      }

      if (userExists) {
        return res.render('login', { error: 'Gebruiker bestaat al' })
      }

      // Create auth user
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: username
      })

      // Hash password for database storage
      const hashedPassword = await bcrypt.hash(password, 10)

      // Store user data in Realtime Database
      await db.ref(`users/${userRecord.uid}`).set({
        id: userRecord.uid,
        username,
        email,
        avatar: '/default-avatar.png',
        password: hashedPassword,
        createdAt: new Date().toISOString()
      })
      console.log(`✓ User registered and saved to Firebase: ${email} (${userRecord.uid})`)

      // Create session
      const sessionId = uuidv4()
      setSession(sessionId, {
        id: userRecord.uid,
        username,
        email,
        avatar: '/default-avatar.png'
      })

      res.cookie('sessionId', sessionId)
      return res.redirect('/chat')
    }

    if (action === 'login') {
      try {
        // Check if user exists in Firebase Auth
        const userRecord = await auth.getUserByEmail(email)
        
        // Get user data from Realtime Database
        const snapshot = await db.ref(`users/${userRecord.uid}`).once('value')
        const userData = snapshot.val()

        if (!userData) {
          return res.render('login', { error: 'Gebruiker data niet gevonden in database' })
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, userData.password || '')
        if (!passwordMatch) {
          return res.render('login', { error: 'Ongeldig wachtwoord' })
        }

        // Create session
        const sessionId = uuidv4()
        setSession(sessionId, userData)
        console.log(`✓ User logged in: ${email} (${userRecord.uid})`)

        res.cookie('sessionId', sessionId)
        return res.redirect('/chat')
      } catch (err) {
        console.error('Login error:', err.message)
        return res.render('login', { error: 'Ongeldig email of wachtwoord' })
      }
    }

    res.render('login', { error: 'Ongeldige actie' })
  } catch (err) {
    console.error('Auth error:', err)
    res.render('login', { error: 'Er is een fout opgetreden' })
  }
})

// Chat page (protected)
app.get('/chat', async (req, res) => {
  const { sessionId } = req.cookies
  const currentUser = getSession(sessionId)

  if (!currentUser) {
    return res.redirect('/login')
  }

  try {
    if (!firebaseInitialized) {
      // Demo mode
      const otherUsers = Object.values(demoData.users)
        .filter(u => u.id && u.id !== currentUser.id)
        .slice(0, 10) // Limit to 10 users

      const userChatsData = demoData.userchats[currentUser.id] || { chats: [] }
      
      let chatsWithMessages = []
      if (userChatsData.chats && Array.isArray(userChatsData.chats)) {
        for (const chat of userChatsData.chats) {
          const messages = demoData.chats[chat.chatId]?.messages || []
          const otherUser = Object.values(demoData.users).find(u => 
            u.id && u.id !== currentUser.id && chat.participants.includes(u.id)
          )
          
          chatsWithMessages.push({
            ...chat,
            lastMessage: messages.length > 0 ? messages[messages.length - 1].text : '',
            otherUser,
            messageCount: messages.length
          })
        }
      }

      return res.render('chat', {
        currentUser,
        otherUsers,
        chatsWithMessages
      })
    }

    // Firebase mode
    const usersSnapshot = await db.ref('users').once('value')
    const allUsers = usersSnapshot.val() || {}
    
    console.log(`📊 Loaded ${Object.keys(allUsers).length} users from Firebase`)
    const otherUsers = Object.values(allUsers).filter(u => u.id !== currentUser.id)

    const chatsSnapshot = await db.ref(`userchats/${currentUser.id}`).once('value')
    const userChatsData = chatsSnapshot.val() || { chats: [] }
    
    let chatsWithMessages = []
    
    if (userChatsData.chats && Array.isArray(userChatsData.chats)) {
      for (const chat of userChatsData.chats) {
        const messagesSnapshot = await db.ref(`chats/${chat.chatId}/messages`).once('value')
        const messages = messagesSnapshot.val() || {}
        
        const messageArray = Object.values(messages).sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        )
        
        const otherUser = Object.values(allUsers).find(u => 
          u.id !== currentUser.id && chat.participants.includes(u.id)
        )
        
        chatsWithMessages.push({
          ...chat,
          lastMessage: messageArray.length > 0 ? messageArray[messageArray.length - 1].text : '',
          otherUser,
          messageCount: messageArray.length
        })
      }
    }

    res.render('chat', {
      currentUser,
      otherUsers,
      chatsWithMessages
    })
  } catch (err) {
    console.error('Chat page error:', err)
    res.render('chat', {
      currentUser,
      otherUsers: [],
      chatsWithMessages: [],
      error: 'Fout bij laden chat'
    })
  }
})

// Get messages for a user
app.get('/messages', async (req, res) => {
  const { sessionId } = req.cookies
  const currentUser = getSession(sessionId)

  if (!currentUser) {
    return res.status(401).json({ messages: [] })
  }

  const { userId } = req.query

  try {
    if (!firebaseInitialized) {
      // Demo mode
      const userChatsData = demoData.userchats[currentUser.id] || { chats: [] }
      const chat = userChatsData.chats?.find(c => 
        c.participants && c.participants.includes(userId)
      )

      if (!chat) {
        return res.json({ messages: [] })
      }

      const messages = demoData.chats[chat.chatId]?.messages || []
      return res.json({ messages })
    }

    // Firebase mode
    const chatsSnapshot = await db.ref(`userchats/${currentUser.id}`).once('value')
    const userChatsData = chatsSnapshot.val() || { chats: [] }

    const chat = userChatsData.chats?.find(c => 
      c.participants && c.participants.includes(userId)
    )

    if (!chat) {
      return res.json({ messages: [] })
    }

    const messagesSnapshot = await db.ref(`chats/${chat.chatId}/messages`).once('value')
    const messagesObj = messagesSnapshot.val() || {}
    
    const messages = Object.values(messagesObj).sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    )

    res.json({ messages })
  } catch (err) {
    console.error('Get messages error:', err)
    res.json({ messages: [] })
  }
})

// Send message
app.post('/message', async (req, res) => {
  const { sessionId } = req.cookies
  const currentUser = getSession(sessionId)

  if (!currentUser) {
    return res.status(401).json({ success: false })
  }

  const { receiverId, text } = req.body

  try {
    if (!firebaseInitialized) {
      // Demo mode
      const userChatsData = demoData.userchats[currentUser.id] || { chats: [] }
      
      let chat = userChatsData.chats?.find(c => 
        c.participants && c.participants.includes(receiverId)
      )

      if (!chat) {
        const chatId = uuidv4()
        chat = {
          chatId,
          participants: [currentUser.id, receiverId],
          createdAt: new Date().toISOString()
        }

        userChatsData.chats = userChatsData.chats || []
        userChatsData.chats.push(chat)
        demoData.userchats[currentUser.id] = userChatsData

        const receiverChatsData = demoData.userchats[receiverId] || { chats: [] }
        receiverChatsData.chats = receiverChatsData.chats || []
        receiverChatsData.chats.push(chat)
        demoData.userchats[receiverId] = receiverChatsData

        demoData.chats[chat.chatId] = { messages: [] }
      }

      const message = {
        id: uuidv4(),
        senderId: currentUser.id,
        text,
        createdAt: new Date().toISOString()
      }

      if (!demoData.chats[chat.chatId]) {
        demoData.chats[chat.chatId] = { messages: [] }
      }
      demoData.chats[chat.chatId].messages.push(message)

      return res.json({ success: true })
    }

    // Firebase mode
    const chatsSnapshot = await db.ref(`userchats/${currentUser.id}`).once('value')
    const userChatsData = chatsSnapshot.val() || { chats: [] }
    
    let chat = userChatsData.chats?.find(c => 
      c.participants && c.participants.includes(receiverId)
    )

    if (!chat) {
      const chatId = uuidv4()
      chat = {
        chatId,
        participants: [currentUser.id, receiverId],
        createdAt: new Date().toISOString()
      }

      userChatsData.chats = userChatsData.chats || []
      userChatsData.chats.push(chat)
      
      await db.ref(`userchats/${currentUser.id}`).set(userChatsData)

      const receiverChatsSnapshot = await db.ref(`userchats/${receiverId}`).once('value')
      const receiverChatsData = receiverChatsSnapshot.val() || { chats: [] }
      receiverChatsData.chats = receiverChatsData.chats || []
      receiverChatsData.chats.push(chat)
      
      await db.ref(`userchats/${receiverId}`).set(receiverChatsData)
    }

    const messageId = uuidv4()
    const message = {
      id: messageId,
      senderId: currentUser.id,
      text,
      createdAt: new Date().toISOString()
    }

    await db.ref(`chats/${chat.chatId}/messages/${messageId}`).set(message)

    res.json({ success: true })
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Logout
app.post('/logout', (req, res) => {
  const { sessionId } = req.cookies
  if (sessionId) {
    clearSession(sessionId)
  }
  res.clearCookie('sessionId')
  res.json({ success: true })
})

// Start server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Chat app started on http://localhost:${PORT}`)
})
