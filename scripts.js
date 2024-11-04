// Existing code
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const chatForm = document.getElementById('chatForm');
const menuButton = document.getElementById('menuButton');
const navbar = document.getElementById('navbar');
const closeNavButton = document.getElementById('closeNavButton');
const reportDialog = document.getElementById('reportDialog');
const submitReportButton = document.getElementById('submitReport');
const cancelReportButton = document.getElementById('cancelReport');
const navButtons = document.querySelectorAll('.nav-button');
const sections = {
    home: document.getElementById('homeSection'),
    about: document.getElementById('aboutSection'),
    contact: document.getElementById('contactSection')
};
const notificationsContainer = document.getElementById('notifications');
const contactForm = document.getElementById('contactForm');
const welcomeMessage = document.getElementById('welcomeMessage');
const sendButton = document.getElementById('sendButton');
const sendIcon = document.getElementById('sendIcon');
const sendText = document.getElementById('sendText');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const clearHistoryModal = document.getElementById('clearHistoryModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalClearBtn = document.getElementById('modalClearBtn');

// ... (rest of the existing code) ...

// New code for handling the welcome page
function showMainContent() {
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('mainContent').classList.remove('hidden');
}

// Modify the window load event listener
window.addEventListener('load', () => {
    // Existing code
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 500);

    loadStoredHistory();

    const hash = window.location.hash.slice(1);
    if (sections[hash]) {
        switchSection(hash);
    }

    updateClearHistoryButton();
    scrollToBottom();

    // New code: Check if it's the user's first visit
    if (!localStorage.getItem('hasVisited')) {
        // Show welcome page
        document.getElementById('welcomePage').style.display = 'block';
        document.getElementById('mainContent').classList.add('hidden');
        localStorage.setItem('hasVisited', 'true');
    } else {
        // Show main content directly
        showMainContent();
    }
});

// ... (rest of the existing code) ...

// Add event listener for the "Start Chatting" button on the welcome page
document.addEventListener('DOMContentLoaded', () => {
    const startChattingBtn = document.getElementById('startChattingBtn');
    if (startChattingBtn) {
        startChattingBtn.addEventListener('click', showMainContent);
    }
});
