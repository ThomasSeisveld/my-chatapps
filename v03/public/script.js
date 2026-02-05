const card = document.getElementById('card');
const overlay = document.getElementById('overlay');
const cardInner = document.querySelector('.card__inner');
const toggleButton = document.getElementById('toggleButton');
const toggleChatButton = document.getElementById('toggleChatButton');
const backButton = document.getElementById('backButton');
const closeChatBtn = document.getElementById('closeChatBtn');
const studentInputArea = document.getElementById('studentInputArea');
const studentProfile = document.getElementById('studentProfile');
const chatMessages = document.getElementById('chatMessages');
const chatInputArea = document.getElementById('chatInputArea');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const submitStudentIdBtn = document.getElementById('submitStudentId');
const studentIdInput = document.getElementById('studentId');

let currentStudentId = null;
let currentStudentData = null;

const toggleChat = () => {
  if (overlay.classList.contains("hidden")) {
    cardInner.classList.add('hidden');
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    card.classList.add("opened");
    studentInputArea.style.display = 'flex';
    studentProfile.style.display = 'none';
    chatMessages.style.display = 'none';
    chatInputArea.style.display = 'none';
    studentIdInput.value = '';
    currentStudentId = null;
  }
  else {
  cardInner.classList.remove('hidden');
  overlay.classList.add('hidden');
  overlay.classList.remove('active');
  card.classList.remove('opened');

  if (chatInterval) {
    clearInterval(chatInterval);
    chatInterval = null;
  }
}
};

toggleChatButton.addEventListener("click", () => {
   toggleChat();
});

closeChatBtn.addEventListener("click", () => {
   toggleChat();
});

toggleButton.addEventListener('click', () => {
  card.classList.add('flipped');
});

backButton.addEventListener('click', () => {
  card.classList.remove('flipped');
});

// Student ID submission - fetch student data from API
submitStudentIdBtn.addEventListener('click', async () => {
  const studentId = studentIdInput.value.trim();
  
  if (!studentId) {
    alert('Voer alstublieft je student ID in');
    return;
  }
  
  try {
    // Fetch student data from API
    const response = await fetch(`https://fdnd.directus.app/items/person/${studentId}`);
    const data = await response.json();
    
    if (!data.data) {
      alert('Student niet gevonden. Controleer je ID.');
      return;
    }
    
    const studentData = data.data;
    currentStudentId = studentId;
    currentStudentData = studentData;
    
    // Display student profile
    displayStudentProfile(studentData);
    studentInputArea.style.display = 'none';
    studentProfile.style.display = 'flex';
    chatMessages.style.display = 'flex';
    chatInputArea.style.display = 'flex';
    let chatInterval = null;
    chatMessages.innerHTML = '';
    loadChatHistory();

    if (chatInterval) clearInterval(chatInterval);

    chatInterval = setInterval(() => {
      loadChatHistory();
    }, 5000);

  } catch (error) {
    console.error('Error fetching student data:', error);
    alert('Fout bij ophalen studentgegevens.');
  }
});

function displayStudentProfile(studentData) {
  document.getElementById('studentName').textContent = studentData.name || 'Student';
  const bioText = studentData.bio 
    ? studentData.bio.replace(/<[^>]*>/g, '').substring(0, 100)
    : '';
  document.getElementById('studentBio').textContent = bioText;
  
  const avatarImg = document.getElementById('studentAvatar');
  if (studentData.avatar) {
    avatarImg.src = studentData.avatar;
  } else {
    avatarImg.src = 'https://via.placeholder.com/60';
  }
}

// Load chat history from server
async function loadChatHistory() {
  try {
    const response = await fetch(`/messages?studentId=${encodeURIComponent(currentStudentId)}`);
    const data = await response.json();
    
    chatMessages.innerHTML = '';
    if (data.messages && data.messages.length > 0) {
      data.messages.forEach(msg => {
        displayMessage(msg.text, msg.senderId === 'admin', msg.timestamp);
      });
    }
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Display a message in the chat
function displayMessage(text, isOwn, timestamp) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${isOwn ? 'other' : 'own'}`;
  
  const date = new Date(timestamp).toLocaleString('nl-NL');
  messageEl.innerHTML = `<p>${escapeHtml(text)}</p><span class="message-time">${date}</span>`;
  
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loadChatHistory();
  const text = messageInput.value.trim();
  if (!text || !currentStudentId) return;
  
  try {
    const response = await fetch('/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: currentStudentId,
        message: text
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayMessage(text, true, new Date().toISOString());
      messageInput.value = '';
      messageInput.focus();
    } else {
      alert('Fout bij versturen van bericht: ' + data.error);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Fout bij versturen van bericht');
  }
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
