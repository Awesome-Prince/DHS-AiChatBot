// ... (previous code remains unchanged)

function initializeChat() {
    console.log('Initializing chat...');
    loadStoredHistory();
    updateClearHistoryButton();
    scrollToBottom();
}

// ... (rest of the existing code)

// Modify the window load event listener
window.addEventListener('load', () => {
    console.log('Window loaded');
    
    // Check if it's the user's first visit
    if (!localStorage.getItem('hasVisited')) {
        console.log('First visit, showing welcome page');
        document.getElementById('welcomePage').style.display = 'block';
        document.getElementById('mainContent').classList.add('hidden');
        localStorage.setItem('hasVisited', 'true');
    } else {
        console.log('Returning user, showing main content');
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('mainContent').classList.remove('hidden');
        initializeChat();
    }
});

// ... (rest of the code remains unchanged)

// Make initializeChat available globally
window.initializeChat = initializeChat;
