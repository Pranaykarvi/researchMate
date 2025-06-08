// background.js - Service Worker for ResearchMate Chrome Extension

// Configuration
const API_BASE_URL = 'https://researchmate.onrender.com'; // Change to your production URL

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainWithResearchMate",
    title: "Explain this with ResearchMate",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "explainWithResearchMate") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
  
        if (!tab || typeof tab.id !== 'number' || tab.id < 0) {
          console.error("Tab info missing or invalid when handling context menu click:", tab);
          return;
        }
  
        if (tab.url?.startsWith("chrome://") || tab.url?.startsWith("devtools://")) {
          console.warn("Cannot run on internal Chrome or DevTools pages.");
          return;
        }
  
        handleTextExplanation(info.selectionText, tab);
      });
    }
  });
  

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-chatbot") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || typeof tabs[0].id !== 'number' || tabs[0].id < 0) {
        console.error("Invalid tab for shortcut execution:", tabs[0]);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: toggleChatbot
      });
    });
  }
});

// Function to toggle chatbot (injected into page)
function toggleChatbot() {
  const existingSidebar = document.getElementById('researchmate-sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  } else {
    window.postMessage({ type: 'RESEARCHMATE_OPEN_CHATBOT' }, '*');
  }
}

// Handle text explanation
async function handleTextExplanation(selectedText, tab) {
  try {
    if (!tab || typeof tab.id !== 'number' || tab.id < 0) {
      console.error("Invalid tab object. Cannot send message. Tab:", tab);
      return;
    }

    // Show loading
    chrome.tabs.sendMessage(tab.id, {
      action: "showLoading",
      text: selectedText
    });

    // API call
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: selectedText,
        context: "academic_research"
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    await chrome.storage.local.set({
      [`explanation_${Date.now()}`]: {
        text: selectedText,
        explanation: data.explanation,
        summary: data.summary,
        keyTerms: data.keyTerms,
        timestamp: new Date().toISOString()
      }
    });

    chrome.tabs.sendMessage(tab.id, {
      action: "showExplanation",
      data: data,
      originalText: selectedText
    });

  } catch (error) {
    console.error('Error getting explanation:', error);
    if (tab && typeof tab.id === 'number' && tab.id >= 0) {
      chrome.tabs.sendMessage(tab.id, {
        action: "showError",
        error: "Failed to get explanation. Please check your connection and try again."
      });
    }
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "chatQuery") {
    handleChatQuery(request.query, request.context)
      .then(response => sendResponse({ success: true, data: response }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }

  if (request.action === "getHistory") {
    getStorageHistory()
      .then(history => sendResponse({ success: true, data: history }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle chat queries
async function handleChatQuery(query, context = "") {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        context: context,
        conversation_id: await getOrCreateConversationId()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    await chrome.storage.local.set({
      [`chat_${Date.now()}`]: {
        query: query,
        response: data.response,
        context: context,
        timestamp: new Date().toISOString()
      }
    });

    return data;
  } catch (error) {
    console.error('Error in chat query:', error);
    throw error;
  }
}

// Get or create conversation ID for chat continuity
async function getOrCreateConversationId() {
  const result = await chrome.storage.local.get(['conversationId']);
  if (result.conversationId) {
    return result.conversationId;
  }

  const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  await chrome.storage.local.set({ conversationId: newId });
  return newId;
}

// Get storage history
async function getStorageHistory() {
  const result = await chrome.storage.local.get(null);
  const history = [];

  for (const [key, value] of Object.entries(result)) {
    if (key.startsWith('explanation_') || key.startsWith('chat_')) {
      history.push({
        id: key,
        type: key.startsWith('explanation_') ? 'explanation' : 'chat',
        ...value
      });
    }
  }

  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return history;
}
