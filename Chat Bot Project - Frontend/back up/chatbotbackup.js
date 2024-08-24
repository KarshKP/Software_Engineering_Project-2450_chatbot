// JavaScript to handle open/close of the chat window
document.addEventListener('DOMContentLoaded', function() {
    const chatbotIcon = document.getElementById('chatbotIcon');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');

    // Open chat window when chatbot icon is clicked
    chatbotIcon.addEventListener('click', function() {
        chatWindow.style.display = 'flex';
    });

    // Close chat window when close button is clicked
    closeChat.addEventListener('click', function() {
        chatWindow.style.display = 'none';
    });
});
