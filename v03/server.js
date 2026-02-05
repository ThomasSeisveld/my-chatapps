// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import admin from 'firebase-admin'

// Load environment variables
dotenv.config()

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Initialize Firebase Admin SDK
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  databaseURL: process.env.FIREBASE_DATABASE_URL
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: firebaseConfig.databaseURL
  })
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Firebase initialization error:', error)
}

const db = admin.database()

// Vul hier jouw eigen ID in (zie de instructies in de leertaak)
const personID = 254

// Doe een fetch naar een URL op de WHOIS API, ga pas verder als de fetch gelukt is
const personResponse = await fetch('https://fdnd.directus.app/items/person/' + personID)

// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
const personResponseJSON = await personResponse.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(personResponseJSON)

// Functie om user data op te slaan in Firebase Realtime Database
async function saveUserToFirebase(userData) {
  try {
    const userId = userData.id ? String(userData.id) : 'admin-user'
    if (!userId || userId === 'admin-user' && !userData.id) {
      console.warn('⚠️ Skipping Firebase save - no valid user ID')
      return
    }
    
    // Only save fields that exist
    const dataToSave = {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar,
      bio: userData.bio,
      updatedAt: new Date().toISOString()
    }
    
    // Add optional fields if they exist
    if (userData.email) dataToSave.email = userData.email
    if (userData.nickname) dataToSave.nickname = userData.nickname
    if (userData.github_handle) dataToSave.github_handle = userData.github_handle
    if (userData.custom) dataToSave.custom = userData.custom
    
    const userRef = db.ref(`users/${userId}`)
    await userRef.set(dataToSave)
    console.log(`✅ User ${userData.name} (ID: ${userId}) saved to Firebase Realtime Database`)
  } catch (error) {
    console.error('❌ Error saving user to Firebase:', error.message)
  }
}

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Parse JSON en URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Om Views weer te geven, heb je Routes nodig
// Maak een GET route voor de index (meestal doe je dit in de root, als /)
// In je visitekaartje was dit waarschijnlijk index.html
app.get('/', async function (request, response) {
   const personResponse = await fetch('https://fdnd.directus.app/items/person/' + personID)
   // Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
   const personResponseJSON = await personResponse.json()
   // parse de custom data, als die er is.
   const personData = personResponseJSON.data
   if (personData.custom && typeof personData.custom === 'string') {
      personData.custom = JSON.parse(personData.custom)
   }
   
   // Save user data to Firebase
   await saveUserToFirebase(personData)
   
   console.log(personData)
   // Render index.liquid uit de Views map en geef de opgehaalde data mee, in een variabele genaamd person
   response.render('index.liquid', { person: personData })
})

app.get('/oefenen', async function (request, response) {
   // Render practice.liquid uit de Views map en geef de opgehaalde data mee, in een variabele genaamd person
   const personResponse = await fetch('https://fdnd.directus.app/items/person/' + personID)
   const personResponseJSON = await personResponse.json()
   const personData = personResponseJSON.data
   if (personData.custom && typeof personData.custom === 'string') {
      personData.custom = JSON.parse(personData.custom)
   }
   response.render('oefenen.liquid', { person: personData })
})

// Admin pagina
app.get('/admin', async (req, res) => {
  try {
    const messagesRef = db.ref('messages')
    const snapshot = await messagesRef.get()
    
    let allMessages = {}
    if (snapshot.exists()) {
      allMessages = snapshot.val() || {}
    }
    
    // Fetch student data for each conversation
    const conversations = []
    for (const [studentId, messages] of Object.entries(allMessages)) {
      try {
        const studentResponse = await fetch(`https://fdnd.directus.app/items/person/${studentId}`)
        const studentData = await studentResponse.json()
        const student = studentData.data
        
        const messagesList = Object.values(messages || {})
        conversations.push({
          studentId: studentId,
          studentName: student.name,
          studentAvatar: student.avatar,
          messageCount: messagesList.length,
          lastMessage: messagesList.length > 0 ? messagesList[messagesList.length - 1].text : '',
          messages: messagesList
        })
      } catch (error) {
        console.error(`Error fetching student ${studentId}:`, error)
      }
    }
    
    // Sort by most recent
    conversations.sort((a, b) => {
      if (a.messages.length === 0) return 1
      if (b.messages.length === 0) return -1
      const aTime = new Date(a.messages[a.messages.length - 1].timestamp).getTime()
      const bTime = new Date(b.messages[b.messages.length - 1].timestamp).getTime()
      return bTime - aTime
    })
    
    res.render('admin.liquid', { 
      conversations: conversations,
      adminName: 'Thomas'
    })
  } catch (error) {
    console.error('Error loading admin page:', error)
    res.status(500).send('Error loading admin page')
  }
})

// ==================== Chat API Routes ====================

let chatInterval = null;

// Haal berichten op voor een student
app.get('/messages', async function (request, response) {
  try {
    const studentId = request.query.studentId
    
    if (!studentId) {
      return response.status(400).json({ error: 'Student ID is required', messages: [] })
    }
    
    const messagesRef = db.ref(`messages/${studentId}`)
    const snapshot = await messagesRef.get()
    
    let messages = []
    if (snapshot.exists()) {
      messages = Object.values(snapshot.val() || {})
    }
    
    console.log(`📨 Loaded ${messages.length} messages for student ${studentId}`)
    response.json({ messages: messages })
  } catch (error) {
    console.error('❌ Error loading messages:', error)
    response.status(500).json({ error: 'Failed to load messages', messages: [] })
  }
})

// Verstuur een bericht
app.post('/send-message', async function (request, response) {
  try {
    console.log('📤 POST /send-message received')
    console.log('Request body:', request.body)
    
    const { studentId, message } = request.body
    
    if (!studentId || !message) {
      console.error('❌ Missing studentId or message:', { studentId, message })
      return response.status(400).json({ success: false, error: 'Student ID and message are required' })
    }
    
    const messageId = Date.now().toString()
    const newMessage = {
      id: messageId,
      studentId: studentId,
      senderId: studentId,
      text: message,
      timestamp: new Date().toISOString()
    }
    
    // Save to Realtime Database
    const messageRef = db.ref(`messages/${studentId}/${messageId}`)
    await messageRef.set(newMessage)
    
    console.log(`💬 New message from student ${studentId}: ${message}`)
    response.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('❌ Error sending message:', error)
    response.status(500).json({ success: false, error: 'Failed to send message', details: error.message })
  }
})

// Admin antwoord versturen
app.post('/send-reply', async (req, res) => {
  try {
    const { studentId, message } = req.body
    
    if (!studentId || !message) {
      return res.status(400).json({ success: false, error: 'Student ID and message are required' })
    }
    
    const messageId = Date.now().toString()
    const newMessage = {
      id: messageId,
      studentId: studentId,
      senderId: 'admin',
      senderName: 'Thomas',
      text: message,
      timestamp: new Date().toISOString()
    }
    
    // Save to Realtime Database
    const messageRef = db.ref(`messages/${studentId}/${messageId}`)
    await messageRef.set(newMessage)
    
    console.log(`💬 Admin reply to student ${studentId}: ${message}`)
    res.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('❌ Error sending admin reply:', error)
    res.status(500).json({ success: false, error: 'Failed to send reply', details: error.message })
  }
})

// Had je meer pagina's in je oude visitekaartje? Zoals een contact.html?
// Maak daar dan meer Routes voor aan, en koppel ze aan Views
// app.get('/contact', function (request, response) {
// Render bijvoorbeeld contact.liquid uit de views map, zonder daar iets aan mee te geven
// response.render('contact.liquid')
// })

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
   // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
   // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
   response.redirect(303, '/')
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
   // Toon een bericht in de console en geef het poortnummer door
   console.log(`✅ Application started on http://localhost:${app.get('port')}`)
})
