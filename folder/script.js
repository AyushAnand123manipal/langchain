// Configuration
const HF_TOKEN = "hf_your_secure_token"; // Replace with your actual token
const MODEL = "google/flan-t5-small";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

// DOM Elements
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Add message to chat
function addMessage(content, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isUser ? "user-message" : "bot-message");
    messageDiv.textContent = content;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageDiv;
}

// Query the Hugging Face API
async function query(payload) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        return result[0]?.generated_text || "🤖 I'm thinking... Try again!";
    } catch (error) {
        console.error("API Error:", error);
        return "⚠️ Error fetching response. Try again later.";
    }
}

// Handle send button click
async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = "";
    userInput.focus();

    // Show typing indicator
    const typingIndicator = addMessage("🤔 Thinking...", false);

    try {
        const response = await query({
            inputs: `Q: ${message}\nA:`,
            parameters: {
                max_new_tokens: 50,
                temperature: 0.7
            }
        });

        // Update typing indicator with response
        typingIndicator.textContent = response;
    } catch (error) {
        typingIndicator.textContent = "⚠️ Please wait a minute and try again (free tier limits).";
    }
}

// Event listeners
sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});

// Initial bot greeting
addMessage("👋 Hello! I'm your Hugging Face assistant. How can I help?", false);
