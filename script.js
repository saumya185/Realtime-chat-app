
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
    import { 
      getAuth, 
      GoogleAuthProvider, 
      signInWithPopup, 
      signOut,
      onAuthStateChanged 
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
    import { 
      getFirestore, 
      collection, 
      addDoc, 
      serverTimestamp, 
      query, 
      orderBy, 
      limit, 
      onSnapshot,
      doc,
      updateDoc,
      deleteDoc,
      where
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
    import {
      getStorage,
      ref,
      uploadBytes,
      getDownloadURL
    } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDqJvYHJ9NkVXwAmJvq-4gYwB6jYZH4Eq4",
      authDomain: "chat-app-f37b3.firebaseapp.com",
      projectId: "chat-app-f37b3",
      storageBucket: "chat-app-f37b3.appspot.com",
      messagingSenderId: "30249029248",
      appId: "1:30249029248:web:47bb311df825250ba0e065"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const provider = new GoogleAuthProvider();

    // DOM Elements
    const authBtn = document.getElementById('authBtn');
    const messagesContainer = document.getElementById('messagesContainer');
    const messagesDiv = document.getElementById('messages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const loginPrompt = document.getElementById('loginPrompt');
    const themeToggle = document.getElementById('themeToggle');
    const emojiBtn = document.getElementById('emojiBtn');
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiGrid = document.getElementById('emojiGrid');
    const fileBtn = document.getElementById('fileBtn');
    const fileInput = document.getElementById('fileInput');
    const typingIndicator = document.getElementById('typingIndicator');

    // State
    let currentUser = null;
    let unsubscribeMessages = null;
    let isTyping = false;
    let typingTimeout = null;
    let displayedMessages = new Set();

    // Common emojis
    const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    // Initialize emoji picker
    function initEmojiPicker() {
      emojis.forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'emoji-btn';
        button.textContent = emoji;
        button.onclick = () => {
          messageInput.value += emoji;
          emojiPicker.style.display = 'none';
          messageInput.focus();
        };
        emojiGrid.appendChild(button);
      });
    }

    // Theme toggle
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('darkTheme', isDark);
    });

    // Load theme preference
    if (localStorage.getItem('darkTheme') === 'true') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Emoji picker toggle
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', () => {
      emojiPicker.style.display = 'none';
    });

    // File upload
    fileBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      
      // Typing indicator
      handleTyping();
    });

    // Handle typing indicator
    function handleTyping() {
      if (!currentUser) return;
      
      if (!isTyping) {
        isTyping = true;
        // Here you would typically send a typing indicator to Firestore
        // For simplicity, we'll just show a local indicator
      }
      
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        isTyping = false;
        // Stop typing indicator
      }, 1000);
    }

    // Auth state handler
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        authBtn.textContent = 'Logout';
        messageForm.classList.remove('hidden');
        loginPrompt.classList.add('hidden');
        loadMessages();
      } else {
        currentUser = null;
        authBtn.textContent = 'Login';
        messageForm.classList.add('hidden');
        loginPrompt.classList.remove('hidden');
        clearMessages();
        if (unsubscribeMessages) unsubscribeMessages();
      }
    });

    // Auth button click
    authBtn.addEventListener('click', async () => {
      if (currentUser) {
        await signOut(auth);
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (error) {
          console.error("Login error:", error);
          alert("Login failed. Please try again.");
        }
      }
    });

    // Load messages with deduplication
    function loadMessages() {
      const q = query(
        collection(db, "messages"), 
        orderBy("createdAt", "desc"), 
        limit(50)
      );

      unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        
        messages.reverse(); // Show oldest first
        displayMessages(messages);
      });
    }

    // Display messages with deduplication
    function displayMessages(messages) {
      const currentIds = new Set();
      
      messages.forEach(msg => {
        currentIds.add(msg.id);
        if (!displayedMessages.has(msg.id)) {
          displayMessage(msg);
          displayedMessages.add(msg.id);
        }
      });
      
      // Remove messages that are no longer in the current set
      const messageElements = messagesDiv.querySelectorAll('[data-message-id]');
      messageElements.forEach(el => {
        const messageId = el.getAttribute('data-message-id');
        if (!currentIds.has(messageId)) {
          el.remove();
          displayedMessages.delete(messageId);
        }
      });
      
      scrollToBottom();
    }

    // Display individual message
    function displayMessage(msg) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${msg.uid === currentUser?.uid ? 'sent' : ''}`;
      messageDiv.setAttribute('data-message-id', msg.id);
      
      const isOwn = msg.uid === currentUser?.uid;
      const timestamp = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now';
      
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="message-info">
            ${msg.photoURL ? `<img src="${msg.photoURL}" alt="Avatar" class="user-avatar">` : ''}
            <span class="user-name">${msg.name || 'Anonymous'}</span>
            <span class="message-time">${timestamp}</span>
          </div>
          <div class="message-bubble">
            ${msg.text || ''}
            ${msg.imageUrl ? `<img src="${msg.imageUrl}" alt="Shared image" class="file-preview">` : ''}
            ${msg.fileUrl && !msg.imageUrl ? `
              <div class="file-info">
                <i class="fas fa-file"></i>
                <span>${msg.fileName || 'File'}</span>
              </div>
            ` : ''}
          </div>
          ${isOwn ? `
            <div class="message-actions">
              <button class="action-btn" onclick="editMessage('${msg.id}', '${msg.text?.replace(/'/g, "\\'")}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn" onclick="deleteMessage('${msg.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          ` : ''}
        </div>
      `;
      
      messagesDiv.appendChild(messageDiv);
    }

    // Global functions for message actions
    window.editMessage = async (messageId, currentText) => {
      const newText = prompt("Edit message:", currentText);
      if (newText && newText.trim() && newText !== currentText) {
        try {
          await updateDoc(doc(db, "messages", messageId), {
            text: newText.trim(),
            edited: true,
            editedAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Edit error:", error);
          alert("Failed to edit message.");
        }
      }
    };

    window.deleteMessage = async (messageId) => {
      if (confirm("Are you sure you want to delete this message?")) {
        try {
          await deleteDoc(doc(db, "messages", messageId));
        } catch (error) {
          console.error("Delete error:", error);
          alert("Failed to delete message.");
        }
      }
    };

    // Handle file upload
    async function handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file || !currentUser) return;

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      try {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // Upload file to Firebase Storage
        const storageRef = ref(storage, `files/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Send message with file
        const messageData = {
          uid: currentUser.uid,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp(),
          fileName: file.name,
          fileUrl: downloadURL
        };

        // Check if it's an image
        if (file.type.startsWith('image/')) {
          messageData.imageUrl = downloadURL;
        }

        await addDoc(collection(db, "messages"), messageData);
        
        // Clear file input
        fileInput.value = '';
      } catch (error) {
        console.error("File upload error:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
      }
    }

    // Clear messages
    function clearMessages() {
      messagesDiv.innerHTML = '';
      displayedMessages.clear();
    }

    // Scroll to bottom
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send message
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = messageInput.value.trim();
      
      if (!message || !currentUser) return;

      try {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        await addDoc(collection(db, "messages"), {
          text: message,
          uid: currentUser.uid,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: serverTimestamp()
        });
        
        messageInput.value = '';
        messageInput.style.height = 'auto';
      } catch (error) {
        console.error("Send error:", error);
        alert("Failed to send message. Please try again.");
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
      }
    });

    // Enter key to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        messageForm.dispatchEvent(new Event('submit'));
      }
    });

    // Initialize emoji picker
    initEmojiPicker();

    // Show login prompt initially
    loginPrompt.classList.remove('hidden');
