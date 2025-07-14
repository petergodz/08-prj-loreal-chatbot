
// Get references to DOM elements
// Store the Cloudflare Worker URL in a variable
const workerUrl = 'https://loreal.pgodziela.workers.dev/';
const chatForm = document.getElementById('chatForm'); // The form for user input
const chatInput = document.getElementById('userInput'); // The input box for user messages
const chatMessages = document.getElementById('chatWindow'); // The chat display area

// Store the conversation history as an array of messages
let messages = [
  { role: 'system', content: 'You are a helpful assistant.' }
];

// Function to add a message to the chat display
function addMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = role === 'user' ? 'user-message' : 'bot-message';
  if (role === 'user') {
    messageDiv.textContent = 'Me: ' + content;
  } else {
    messageDiv.textContent = content;
  }
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
}

// Function to send user input to the Cloudflare Worker and get a response
async function sendMessage(userText) {

  // Add user's message to the conversation history
  messages.push({ role: 'user', content: userText });

  // Show the user's message in the chat window (above the bot's reply)
  addMessage('user', userText);

  // Show a loading message below the user's message
  addMessage('bot', 'Thinking...');

  try {
    // Send the prompt template info and user input to the Cloudflare Worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: {
          id: "pmpt_687308457cd481969dd09f1f84cb51a701b59e0f4b04cb34",
          version: "3"
        },
        user_input: userText
      })
    });
    const data = await response.json();

    // Try to get the chatbot's reply from different possible response formats
    let botReply = '';
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      botReply = data.choices[0].message.content;
    } else if (data.result) {
      botReply = data.result;
    } else if (typeof data === 'string') {
      botReply = data;
    } else {
      // Show the full response for debugging if no recognized field is found
      botReply = 'Debug: ' + JSON.stringify(data);
    }

    // Remove the loading message
    chatMessages.lastChild.remove();

    // Add the bot's reply to the chat and conversation history
    addMessage('bot', botReply);
    messages.push({ role: 'assistant', content: botReply });
  } catch (error) {
    // Remove the loading message
    chatMessages.lastChild.remove();
    addMessage('bot', 'Error: Could not reach the chatbot.');
  }
}

// Listen for form submission (user sends a message)
chatForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent page reload
  const userText = chatInput.value.trim();
  if (userText) {
    sendMessage(userText);
    chatInput.value = '';
  }
});
