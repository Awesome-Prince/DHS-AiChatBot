// ... (previous code remains unchanged)

let isGenerating = false;
let currentRequest = null;

async function sendMessage(message) {
    if (message.trim()) {
        addMessage('user', message);
        setThinking(true);
        try {
            currentRequest = axios.CancelToken.source();
            console.log('Sending request to API...');
            const response = await axios.post('https://api.qewertyy.dev/models', {
                messages: [
                    { role: "system", content: schoolData },
                    ...conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    { role: "user", content: message }
                ],
                model_id: 23
            }, {
                cancelToken: currentRequest.token,
                timeout: 30000 // 30 seconds timeout
            });
            console.log('Received response from API:', response);
            if (response.data.content && response.data.content[0] && response.data.content[0].text) {
                const aiResponse = response.data.content[0].text;
                addMessage('assistant', aiResponse);
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else if (error.code === 'ECONNABORTED') {
                addNotification('error', 'Request timed out. Please try again.');
            } else {
                addNotification('error', `Failed to get response. Please try again. Error: ${error.message}`);
            }
        } finally {
            setThinking(false);
            currentRequest = null;
            scrollToBottom();
        }
    }
}

function setThinking(thinking) {
    console.log('setThinking:', thinking);
    const existingThinkingElement = chatContainer.querySelector('.thinking-indicator');
    if (thinking) {
        if (!existingThinkingElement) {
            const thinkingElement = document.createElement('div');
            thinkingElement.className = 'flex justify-start animate-fade-in-up thinking-indicator';
            thinkingElement.innerHTML = `
                <div class="flex items-end space-x-2 max-w-[80%]">
                    <div class="w-8 h-8 bg-transparent rounded-full">
                        <img src="src/dharam.jpg" alt="AI" class="ai-logo">
                    </div>
                    <div class="p-3 rounded-lg bg-blue-100 text-sm md:text-base shadow-md">
                        <div class="flex space-x-2">
                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                            <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                        </div>
                    </div>
                </div>
            `;
            chatContainer.appendChild(thinkingElement);
        }
        setGenerating(true);
    } else {
        if (existingThinkingElement) {
            existingThinkingElement.remove();
        }
        setGenerating(false);
    }
    scrollToBottom();
}

function setGenerating(generating) {
    console.log('setGenerating:', generating);
    isGenerating = generating;
    if (generating) {
        sendIcon.className = 'fas fa-stop h-4 w-4 md:mr-2';
        sendText.textContent = 'Stop';
        sendButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        sendButton.classList.add('bg-red-500', 'hover:bg-red-600');
    } else {
        sendIcon.className = 'fas fa-paper-plane h-4 w-4 md:mr-2';
        sendText.textContent = 'Send';
        sendButton.classList.remove('bg-red-500', 'hover:bg-red-600');
        sendButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
}

function initializeChat() {
    console.log('Initializing chat...');
    loadStoredHistory();
    updateClearHistoryButton();
    scrollToBottom();

    // Ensure the chat form is properly set up
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');
        const message = userInput.value.trim();
        if (isGenerating) {
            console.log('Cancelling current request');
            if (currentRequest) {
                currentRequest.cancel('Operation canceled by the user.');
            }
            setThinking(false);
        } else if (message) {
            console.log('Sending message:', message);
            sendMessage(message);
            userInput.value = '';
        }
    });
}

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
        showMainContent();
    }
});

function showMainContent() {
    console.log('Showing main content');
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('mainContent').classList.remove('hidden');
    initializeChat();
}

// ... (rest of the code remains unchanged)

// Make initializeChat and showMainContent available globally
window.initializeChat = initializeChat;
window.showMainContent = showMainContent;
