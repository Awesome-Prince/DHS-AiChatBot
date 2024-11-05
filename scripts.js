let isGenerating = false;
let currentRequest = null;
let conversationHistory = [];

function addMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`;
    messageElement.innerHTML = `
        <div class="flex items-start space-x-2 max-w-[80%] ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}">
            <div class="${role === 'user' ? 'user-avatar' : 'ai-avatar'} w-8 h-8 flex items-center justify-center rounded-full ${role === 'user' ? 'bg-blue-500' : 'bg-gray-200'}">
                ${role === 'user' 
                    ? '<i class="fas fa-user text-white text-sm"></i>' 
                    : '<img src="src/dharam.jpg" alt="AI" class="w-full h-full object-cover rounded-full">'}
            </div>
            <div class="message-bubble ${role === 'user' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900'} p-3 rounded-lg text-sm md:text-base shadow-md">
                ${content}
            </div>
        </div>
    `;
    document.getElementById('chatContainer').appendChild(messageElement);
    conversationHistory.push({ role, content });
    scrollToBottom();
}

async function sendMessage(message) {
    if (message.trim()) {
        addMessage('user', message);
        setThinking(true);
        try {
            currentRequest = axios.CancelToken.source();
            const response = await axios.post('https://api.qewertyy.dev/models', {
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    ...conversationHistory.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    { role: "user", content: message }
                ],
                model_id: 23
            }, {
                cancelToken: currentRequest.token,
                timeout: 30000
            });
            if (response.data.content && response.data.content[0] && response.data.content[0].text) {
                const aiResponse = response.data.content[0].text;
                addMessage('assistant', aiResponse);
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        } finally {
            setThinking(false);
            currentRequest = null;
            scrollToBottom();
        }
    }
}

function setThinking(thinking) {
    const existingThinkingElement = document.querySelector('.thinking-indicator');
    if (thinking) {
        if (!existingThinkingElement) {
            const thinkingElement = document.createElement('div');
            thinkingElement.className = 'flex justify-start animate-fade-in-up thinking-indicator';
            thinkingElement.innerHTML = `
                <div class="flex items-end space-x-2 max-w-[80%]">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <img src="src/dharam.jpg" alt="AI" class="w-full h-full object-cover rounded-full">
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
            document.getElementById('chatContainer').appendChild(thinkingElement);
        }
        isGenerating = true;
    } else {
        if (existingThinkingElement) {
            existingThinkingElement.remove();
        }
        isGenerating = false;
    }
    updateSendButton();
}

function updateSendButton() {
    const sendButton = document.getElementById('sendButton');
    const sendIcon = document.getElementById('sendIcon');
    const sendText = document.getElementById('sendText');
    
    if (isGenerating) {
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

function scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function initializeChat() {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    function handleSubmit(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        if (isGenerating) {
            if (currentRequest) {
                currentRequest.cancel('Operation canceled by the user.');
            }
            setThinking(false);
        } else if (message) {
            sendMessage(message);
            userInput.value = '';
        }
    }

    chatForm.addEventListener('submit', handleSubmit);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubmit(e);
    });
}

function showMainContent() {
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('mainContent').classList.remove('hidden');
    initializeChat();
}

window.addEventListener('load', () => {
    if (!localStorage.getItem('hasVisited')) {
        document.getElementById('welcomePage').style.display = 'block';
        document.getElementById('mainContent').classList.add('hidden');
        localStorage.setItem('hasVisited', 'true');
    } else {
        showMainContent();
    }
});

window.initializeChat = initializeChat;
window.showMainContent = showMainContent;
