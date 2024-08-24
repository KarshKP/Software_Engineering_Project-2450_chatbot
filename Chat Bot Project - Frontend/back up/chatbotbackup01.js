document.addEventListener('DOMContentLoaded', function() {
    const chatbotIcon = document.getElementById('chatbotIcon');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const sendButton = document.querySelector('.send-button');
    const inputField = document.querySelector('.input-container input[type="text"]');
    const chatBody = document.querySelector('.chat-body');
    const hotTopics = document.querySelectorAll('.hot-topic p');

    // Open chat window
    chatbotIcon.addEventListener('click', function() {
        chatWindow.style.display = 'flex';
    });

    // Close chat window
    closeChat.addEventListener('click', function() {
        chatWindow.style.display = 'none';
    });

    // Handle send button click
    sendButton.addEventListener('click', function() {
        const message = inputField.value.trim();
        if (message) {
            addUserMessage(message);
            inputField.value = ''; // Clear the input field
            // Simulate a chatbot response (optional)
            addChatbotMessage("I'm here to help!");
        }
    });

    // Handle hot topic clicks
    hotTopics.forEach(topic => {
        topic.addEventListener('click', function() {
            const topicText = topic.innerText.trim();
            if (topicText) {
                addUserMessage(topicText);
                // Simulate a chatbot response (optional)
                addChatbotMessage("You've selected a hot topic!");
            }
        });
    });

    // Function to add user message
    function addUserMessage(message) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user');
        userMessage.innerText = message;
        chatBody.appendChild(userMessage);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
    }

    // Function to add chatbot message
    function addChatbotMessage(message) {
        const botMessage = document.createElement('div');
        botMessage.classList.add('chat-message', 'chatbot');
        botMessage.innerText = message;
        chatBody.appendChild(botMessage);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
    }
});

