/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// PLACEHOLDER API URL: Replace this string with your actual Cloudflare Worker URL when deployed.
const API_URL = "YOUR_CLOUDFLARE_WORKER_URL_HERE";

// LevelUp: Maintain Conversation History & Configure the Chatbot Prompt
let conversationHistory = [
  {
    role: "system",
    content: "You are a helpful L'Oréal beauty assistant. You help users discover L'Oréal makeup, skincare, haircare, and fragrances. You must ONLY answer questions related to L'Oréal products, beauty routines, and recommendations. If the user asks about anything unrelated to beauty or L'Oréal, politely refuse to answer and redirect them back to beauty topics."
  }
];

// Set initial welcome message
appendMessage("ai", "👋 Hello! I am your L'Oréal Beauty Assistant. How can I help you find the perfect product today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  // LevelUp: Display User Question & Chat Conversation UI
  appendMessage("user", userText);
  
  // Add user message to history
  conversationHistory.push({ role: "user", content: userText });
  userInput.value = "";

  // Display a temporary loading message
  const loadingMsgId = appendMessage("ai", "Thinking...");

  try {
    // Send request to your Cloudflare Worker / OpenAI proxy
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // Add assistant reply to history
    conversationHistory.push({ role: "assistant", content: aiReply });

    // Update the loading message with the actual response
    updateMessage(loadingMsgId, aiReply);

  } catch (error) {
    console.error("Error:", error);
    updateMessage(loadingMsgId, "Oops! I couldn't connect. Make sure your API_URL placeholder is replaced with your real Cloudflare Worker URL.");
  }
});

/* Helper function to append messages to the DOM */
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  
  // Create a unique ID to update this specific message later (useful for loading states)
  const uniqueId = `msg-${Date.now()}`;
  msgDiv.id = uniqueId;
  
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  
  // Auto-scroll to the bottom of the chat
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return uniqueId;
}

/* Helper function to update existing messages */
function updateMessage(id, text) {
  const msgElement = document.getElementById(id);
  if (msgElement) {
    msgElement.textContent = text;
  }
}
