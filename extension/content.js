// content.js - Content Script for ResearchMate Chrome Extension

let currentSidebar = null;
let currentTooltip = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "showLoading":
      showLoadingTooltip(request.text);
      break;
    case "showExplanation":
      showExplanationSidebar(request.data, request.originalText);
      break;
    case "showError":
      showErrorTooltip(request.error);
      break;
  }
});

// Listen for page messages (for keyboard shortcut)
window.addEventListener('message', (event) => {
  if (event.data.type === 'RESEARCHMATE_OPEN_CHATBOT') {
    openChatbot();
  }
});

// Show loading tooltip
function showLoadingTooltip(text) {
  removeExistingTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.id = 'researchmate-loading-tooltip';
  tooltip.className = 'researchmate-tooltip';
  tooltip.innerHTML = `
    <div class="rm-loading">
      <div class="rm-spinner"></div>
      <p>Analyzing: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"</p>
    </div>
  `;
  
  document.body.appendChild(tooltip);
  currentTooltip = tooltip;
  
  // Position tooltip near cursor
  positionTooltip(tooltip);
}

// Show error tooltip
function showErrorTooltip(error) {
  removeExistingTooltip();
  
  const tooltip = document.createElement('div');
  tooltip.id = 'researchmate-error-tooltip';
  tooltip.className = 'researchmate-tooltip rm-error';
  tooltip.innerHTML = `
    <div class="rm-error-content">
      <span class="rm-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <p><strong>Error:</strong> ${error}</p>
    </div>
  `;
  
  document.body.appendChild(tooltip);
  currentTooltip = tooltip;
  
  positionTooltip(tooltip);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.remove();
    }
  }, 5000);
}

// Show explanation sidebar
function showExplanationSidebar(data, originalText) {
  removeExistingTooltip();
  removeExistingSidebar();
  
  const sidebar = document.createElement('div');
  sidebar.id = 'researchmate-sidebar';
  sidebar.className = 'researchmate-sidebar';
  
  sidebar.innerHTML = `
    <div class="rm-sidebar-header">
      <div class="rm-logo">
        <span class="rm-icon">🔬</span>
        <h3>ResearchMate</h3>
      </div>
      <button class="rm-close-btn" onclick="document.getElementById('researchmate-sidebar').remove()">&times;</button>
    </div>
    
    <div class="rm-sidebar-content">
      <div class="rm-section">
        <h4>Selected Text</h4>
        <div class="rm-selected-text">"${originalText}"</div>
      </div>
      
      <div class="rm-section">
        <h4>Explanation</h4>
        <div class="rm-explanation">${data.explanation}</div>
      </div>
      
      <div class="rm-section">
        <h4>TL;DR Summary</h4>
        <div class="rm-summary">${data.summary}</div>
      </div>
      
      <div class="rm-section">
        <h4>Key Terms</h4>
        <div class="rm-key-terms">
          ${data.keyTerms.map(term => `
            <span class="rm-term" title="${term.definition}">
              <strong>${term.term}:</strong> ${term.definition}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div class="rm-section">
        <h4>Ask Follow-up Questions</h4>
        <div class="rm-chat-container">
          <div class="rm-chat-messages" id="rm-chat-messages"></div>
          <div class="rm-chat-input-container">
            <input type="text" id="rm-chat-input" placeholder="Ask a question about this text..." />
            <button id="rm-chat-send">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  currentSidebar = sidebar;
  
  // Setup chat functionality
  setupChatForSidebar(originalText);
  
  // Animate in
  setTimeout(() => {
    sidebar.classList.add('rm-sidebar-open');
  }, 10);
}

// Open standalone chatbot
function openChatbot() {
  removeExistingSidebar();
  
  const sidebar = document.createElement('div');
  sidebar.id = 'researchmate-sidebar';
  sidebar.className = 'researchmate-sidebar rm-chatbot-mode';
  
  sidebar.innerHTML = `
    <div class="rm-sidebar-header">
      <div class="rm-logo">
        <span class="rm-icon">🔬</span>
        <h3>ResearchMate Chat</h3>
      </div>
      <button class="rm-close-btn" onclick="document.getElementById('researchmate-sidebar').remove()">&times;</button>
    </div>
    
    <div class="rm-sidebar-content">
      <div class="rm-section rm-full-height">
        <div class="rm-chat-container rm-full-chat">
          <div class="rm-chat-messages" id="rm-chat-messages">
            <div class="rm-chat-message rm-bot-message">
              <div class="rm-message-content">
                <p>Hello! I'm ResearchMate, your AI research assistant. I can help you:</p>
                <ul>
                  <li>Explain complex academic concepts</li>
                  <li>Summarize research papers</li>
                  <li>Define technical terms</li>
                  <li>Answer questions about any research topic</li>
                </ul>
                <p>What would you like to know?</p>
              </div>
            </div>
          </div>
          <div class="rm-chat-input-container">
            <input type="text" id="rm-chat-input" placeholder="Ask me anything about research..." />
            <button id="rm-chat-send">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  currentSidebar = sidebar;
  
  // Setup chat functionality
  setupChatForSidebar();
  
  // Animate in
  setTimeout(() => {
    sidebar.classList.add('rm-sidebar-open');
  }, 10);
  
  // Focus input
  document.getElementById('rm-chat-input').focus();
}

// Setup chat functionality
function setupChatForSidebar(context = "") {
  const chatInput = document.getElementById('rm-chat-input');
  const chatSend = document.getElementById('rm-chat-send');
  const chatMessages = document.getElementById('rm-chat-messages');
  
  const sendMessage = async () => {
    const query = chatInput.value.trim();
    if (!query) return;
    
    // Add user message
    addChatMessage(query, 'user');
    chatInput.value = '';
    
    // Add loading message
    const loadingMsg = addChatMessage('Thinking...', 'bot', true);
    
    try {
      // Send query to background script
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'chatQuery',
          query: query,
          context: context
        }, (response) => {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        });
      });
      
      // Remove loading message and add response
      loadingMsg.remove();
      addChatMessage(response.response, 'bot');
      
    } catch (error) {
      loadingMsg.remove();
      addChatMessage(`Sorry, I encountered an error: ${error.message}`, 'bot', false, true);
    }
  };
  
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Add chat message
function addChatMessage(text, sender, isLoading = false, isError = false) {
  const chatMessages = document.getElementById('rm-chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `rm-chat-message rm-${sender}-message ${isLoading ? 'rm-loading-message' : ''} ${isError ? 'rm-error-message' : ''}`;
  
  messageDiv.innerHTML = `
    <div class="rm-message-content">
      ${isLoading ? '<div class="rm-typing-indicator"><span></span><span></span><span></span></div>' : ''}
      <p>${text}</p>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageDiv;
}

// Position tooltip near cursor/selection
function positionTooltip(tooltip) {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${rect.bottom + 10}px`;
    tooltip.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
    tooltip.style.zIndex = '10000';
  }
}

// Utility functions
function removeExistingTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function removeExistingSidebar() {
  if (currentSidebar) {
    currentSidebar.remove();
    currentSidebar = null;
  }
}

// Prevent sidebar from interfering with page content
document.addEventListener('click', (e) => {
  if (e.target.closest('.researchmate-sidebar')) {
    e.stopPropagation();
  }
});

// Handle escape key to close sidebar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentSidebar) {
    currentSidebar.remove();
    currentSidebar = null;
  }
});

console.log('ResearchMate content script loaded');