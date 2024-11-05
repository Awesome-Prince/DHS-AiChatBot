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

let messages = [];
let conversationHistory = [];
let isGenerating = false;
let activeSection = 'home';
let showWelcome = true;
let currentRequest = null;
let schoolData = '';
let imageFolders = [];
let imageFiles = {};

// Fetch school data
fetch('data.txt')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        schoolData = data;
        console.log('School data loaded successfully');
    })
    .catch(error => {
        addNotification('error', `There was a problem loading school data: ${error.message}`);
        console.error('Error loading school data:', error);
    });

// Function to discover folders and images
async function discoverFoldersAndImages() {
    try {
        const response = await fetch('src/imgs/pics.json');
        if (!response.ok) {
            throw new Error('Failed to fetch image index');
        }
        const data = await response.json();
        imageFolders = Object.keys(data);
        imageFiles = data;
        console.log('Folders and images discovered:', imageFiles);
    } catch (error) {
        console.error('Error discovering folders and images:', error);
        addNotification('error', 'Failed to load image data. Some features may not work correctly.');
    }
}

// Call the discovery function when the script loads
discoverFoldersAndImages();

// Function to switch between sections
function switchSection(sectionName) {
    Object.values(sections).forEach(section => section.classList.add('hidden'));
    sections[sectionName].classList.remove('hidden');
    activeSection = sectionName;
    navbar.classList.add('hidden');
    window.location.hash = sectionName;
}

// Function to update clear history button visibility
function updateClearHistoryButton() {
    if (messages.length > 0) {
        clearHistoryBtn.style.display = 'block';
    } else {
        clearHistoryBtn.style.display = 'none';
        showWelcomeMessage();
    }
}

// Function to show welcome message
function showWelcomeMessage() {
    welcomeMessage.classList.remove('hidden');
    chatContainer.classList.add('hidden');
    showWelcome = true;
}

// Function to scroll chat to bottom
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to show clear history modal
function showModal() {
    clearHistoryModal.classList.add('show');
}

// Function to hide clear history modal
function hideModal() {
    clearHistoryModal.classList.remove('show');
}

// Function to clear chat history
function clearHistory() {
    messages = [];
    conversationHistory = [];
    localStorage.removeItem('chatHistory');
    chatContainer.innerHTML = '';
    hideModal();
    addNotification('info', 'Chat history has been cleared.');
    updateClearHistoryButton();
    showWelcomeMessage();
}

// Function to add a message to the chat
function addMessage(role, content) {
    if (showWelcome) {
        welcomeMessage.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        showWelcome = false;
    }
    const messageElement = document.createElement('div');
    messageElement.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`;

    const innerDiv = document.createElement('div');
    innerDiv.className = `flex items-start space-x-2 max-w-full ${role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = role === 'user' ? 'user-avatar' : 'ai-avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<img src="src/dharam.jpg" alt="AI">';

    const messageContent = document.createElement('div');
    messageContent.className = `message-bubble ${role === 'user' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900'} text-sm md:text-base shadow-md`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content';
    contentWrapper.innerHTML = formatMessage(content);

    messageContent.appendChild(contentWrapper);

    if (role === 'assistant') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'flex mt-2 space-x-2';
        actionsDiv.innerHTML = `
            <button data-action="copy" data-content="${escapeHtml(content)}" class="text-blue-500 hover:text-blue-600 transition-colors duration-300">
                <i class="fas fa-copy"></i>
            </button>
            <button data-action="report" data-content="${escapeHtml(content)}" class="text-blue-500 hover:text-blue-600 transition-colors duration-300">
                <i class="fas fa-flag"></i>
            </button>
            <button data-action="again" data-content="${escapeHtml(content)}" class="text-blue-500 hover:text-blue-600 transition-colors duration-300">
                <i class="fas fa-redo"></i>
            </button>
        `;
        messageContent.appendChild(actionsDiv);
    }

    innerDiv.appendChild(avatar);
    innerDiv.appendChild(messageContent);
    messageElement.appendChild(innerDiv);
    chatContainer.appendChild(messageElement);
    scrollToBottom();
    updateClearHistoryButton();
    conversationHistory.push({ role, content });
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
    messages.push({ role, content });
}

// Function to format message content
function formatMessage(content) {
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/`(.*?)`/g, '<code>$1</code>');
    content = content.replace(/^(#{1,6})\s(.*)$/gm, (match, hashes, text) => `<h${hashes.length}>${text}</h${hashes.length}>`);
    content = content.replace(/^\s*[-*+]\s(.*)$/gm, '<li>$1</li>');
    content = content.replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>');

    const orderedList = content.match(/<li>.*<\/li>/g);
    if (orderedList) {
        content = content.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
    }

    const unorderedList = content.match(/<li>.*<\/li>/g);
    if (unorderedList) {
        content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    content = content.replace(/\[([^\]]+)\]$$([^)]+)$$/g, (match, text, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${text}</a>`;
    });

    const links = content.match(/https?:\/\/[^\s]+/g);
    if (links) {
        links.forEach(link => {
            content += `
            <div class="link-preview">
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${link}</a>
            </div>`;
        });
    }

    return content;
}

// Function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to set thinking state
function setThinking(thinking) {
    const existingThinkingElement = chatContainer.querySelector('.thinking-indicator');
    if (existingThinkingElement) {
        existingThinkingElement.remove();
    }

    if (thinking) {
        const thinkingElement = document.createElement('div');
        thinkingElement.className = 'thinking-indicator flex justify-start animate-fade-in-up';
        thinkingElement.innerHTML = `
            <div class="flex items-start space-x-2">
                <div class="ai-avatar">
                    <img src="src/dharam.jpg" alt="AI">
                </div>
                <div class="message-bubble bg-blue-100 text-blue-900 text-sm md:text-base shadow-md">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        chatContainer.appendChild(thinkingElement);
        scrollToBottom();
    }
}

// Function to add notification
function addNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate-fade-in-up`;
    notification.textContent = message;
    notificationsContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Function to get related image folder
async function getRelatedImageFolder(content) {
    try {
        const response = await axios.post('https://api.qewertyy.dev/models', {
            messages: [
                { role: "system", content: "You are a helpful assistant that determines if a given text is related to any of the provided folder names. Respond with the most relevant folder name or 'none' if there's no clear relation." },
                { role: "user", content: `Folders: ${imageFolders.join(', ')}. Text: ${content}` }
            ],
            model_id: 23
        });

        if (response.data.content && response.data.content[0] && response.data.content[0].text) {
            const relatedFolder = response.data.content[0].text.trim().toLowerCase();
            return imageFolders.includes(relatedFolder) ? relatedFolder : null;
        }
        return null;
    } catch (error) {
        console.error('Error determining related folder:', error);
        return null;
    }
}

// Function to get a random image from a folder
function getRandomImage(folder) {
    if (imageFiles[folder] && imageFiles[folder].length > 0) {
        const randomIndex = Math.floor(Math.random() * imageFiles[folder].length);
        return `src/imgs/${folder}/${imageFiles[folder][randomIndex]}`;
    }
    return null;
}

// Function to send message
async function sendMessage(message) {
    if (message.trim()) {
        addMessage('user', message);
        setThinking(true);
        try {
            currentRequest = axios.CancelToken.source();
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
            if (response.data.content && response.data.content[0] && response.data.content[0].text) {
                const aiResponse = response.data.content[0].text;
                addMessage('assistant', aiResponse);

                // Determine if the response is related to any image folder
                const relatedFolder = await getRelatedImageFolder(aiResponse);

                if (relatedFolder) {
                    const imageSrc = getRandomImage(relatedFolder);
                    if (imageSrc) {
                        const img = document.createElement('img');
                        img.src = imageSrc;
                        img.alt = `${relatedFolder} image`;
                        img.className = 'message-image';
                        img.loading = 'lazy';

                        const lastMessage = chatContainer.lastElementChild;
                        lastMessage.querySelector('.message-content').appendChild(img);
                    }
                }
            } else {
                throw new Error('Unexpected response structure');
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                addNotification('info', 'Request was cancelled');
            } else if (error.code === 'ECONNABORTED') {
                addNotification('error', 'Request timed out. Please try again.');
            } else {
                addNotification('error', `An error occurred: ${error.message}`);
                console.error('Error:', error);
            }
        } finally {
            setThinking(false);
            currentRequest = null;
            scrollToBottom();
        }
    }
}

// Event Listeners
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (message && !isGenerating) {
        userInput.value = '';
        await sendMessage(message);
    }
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

menuButton.addEventListener('click', () => {
    navbar.classList.toggle('hidden');
});

closeNavButton.addEventListener('click', () => {
    navbar.classList.add('hidden');
});



navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const section = button.getAttribute('data-section');
        switchSection(section);
    });
});

chatContainer.addEventListener('click', (e) => {
    const target = e.target.closest('button[data-action]');
    if (target) {
        const action = target.getAttribute('data-action');
        const content = target.getAttribute('data-content');

        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(content)
                    .then(() => addNotification('success', 'Copied to clipboard!'))
                    .catch(() => addNotification('error', 'Failed to copy'));
                break;
            case 'report':
                document.getElementById('reportedContent').value = content;
                reportDialog.classList.remove('hidden');
                break;
            case 'again':
                sendMessage(content);
                break;
        }
    }
});

submitReportButton.addEventListener('click', () => {
    const email = document.getElementById('reportEmail').value;
    const problem = document.getElementById('reportProblem').value;
    const reportedContent = document.getElementById('reportedContent').value;

    if (email && problem) {
        console.log('Report submitted:', { email, problem, reportedContent });
        addNotification('success', 'Report submitted successfully!');
        reportDialog.classList.add('hidden');
    } else {
        addNotification('error', 'Please fill in all fields');
    }
});

cancelReportButton.addEventListener('click', () => {
    reportDialog.classList.add('hidden');
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    if (email && message) {
        console.log('Contact form submitted:', { email, message });
        addNotification('success', 'Message sent successfully!');
        contactForm.reset();
    } else {
        addNotification('error', 'Please fill in all fields');
    }
});

clearHistoryBtn.addEventListener('click', showModal);
modalCloseBtn.addEventListener('click', hideModal);
modalCancelBtn.addEventListener('click', hideModal);
modalClearBtn.addEventListener('click', clearHistory);

// Initial setup
window.addEventListener('load', () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        conversationHistory.forEach(msg => addMessage(msg.role, msg.content));
    }

    const hash = window.location.hash.slice(1);
    if (hash && sections[hash]) {
        switchSection(hash);
    }

    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && currentRequest) {
        currentRequest.cancel('User left the page');
    }
});

updateClearHistoryButton();
