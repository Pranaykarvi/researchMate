// popup.js - Popup functionality for ResearchMate

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadCurrentModel();
  });
  
  // Open chatbot in current tab
  function openChatbot() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        func: () => {
          window.postMessage({type: 'RESEARCHMATE_OPEN_CHATBOT'}, '*');
        }
      });
      window.close();
    });
  }
  
  // Show instructions modal
  function showInstructions() {
    const instructions = `
  How to use ResearchMate:
  
  1. SELECT TEXT: Highlight any text on a webpage
  2. RIGHT-CLICK: Choose "Explain this with ResearchMate"
  3. GET INSIGHTS: View explanations, summaries, and key terms
  4. CHAT: Ask follow-up questions in the sidebar
  
  You can also press Ctrl+Shift+E to open the chat anytime!
    `;
    alert(instructions);
  }
  
  // View history
  async function viewHistory() {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({action: 'getHistory'}, resolve);
      });
      
      if (response.success) {
        displayHistory(response.data);
      } else {
        alert('Failed to load history: ' + response.error);
      }
    } catch (error) {
      alert('Error loading history: ' + error.message);
    }
  }
  
  // Display history in a new tab
  function displayHistory(history) {
    const historyHtml = generateHistoryHtml(history);
    
    chrome.tabs.create({
      url: chrome.runtime.getURL('history.html')
    }, (tab) => {
      // Store history data for the new tab
      chrome.storage.local.set({
        tempHistory: history
      });
    });
  }
  
  // Generate HTML for history
  function generateHistoryHtml(history) {
    const items = history.map(item => {
      if (item.type === 'explanation') {
        return `
          <div class="history-item explanation">
            <div class="item-header">
              <span class="item-type">Explanation</span>
              <span class="item-time">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <div class="item-content">
              <strong>Text:</strong> "${item.text}"<br>
              <strong>Explanation:</strong> ${item.explanation}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="history-item chat">
            <div class="item-header">
              <span class="item-type">Chat</span>
              <span class="item-time">${new Date(item.timestamp).toLocaleString()}</span>
            </div>
            <div class="item-content">
              <strong>Q:</strong> ${item.query}<br>
              <strong>A:</strong> ${item.response}
            </div>
          </div>
        `;
      }
    }).join('');
    
    return items;
  }
  
  // Open settings
  function openSettings() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('settings.html')
    });
  }
  
  // Clear history
  async function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      try {
        const storage = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(storage).filter(key => 
          key.startsWith('explanation_') || key.startsWith('chat_')
        );
        
        await chrome.storage.local.remove(keysToRemove);
        loadStats(); // Refresh stats
        alert('History cleared successfully!');
      } catch (error) {
        alert('Error clearing history: ' + error.message);
      }
    }
  }
  
  // Load usage statistics
  async function loadStats() {
    try {
      const storage = await chrome.storage.local.get(null);
      let explanationCount = 0;
      let chatCount = 0;
      
      Object.keys(storage).forEach(key => {
        if (key.startsWith('explanation_')) explanationCount++;
        if (key.startsWith('chat_')) chatCount++;
      });
      
      document.getElementById('explanations-count').textContent = explanationCount;
      document.getElementById('chat-count').textContent = chatCount;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  // Load current model info
  async function loadCurrentModel() {
    try {
      const result = await chrome.storage.local.get(['currentModel', 'modelSwitchCount']);
      const currentModel = result.currentModel || 'OpenAI';
      const switchCount = result.modelSwitchCount || 0;
      
      document.getElementById('current-model').textContent = 
        switchCount > 0 ? `${currentModel} (switched ${switchCount}x)` : currentModel;
    } catch (error) {
      console.error('Error loading model info:', error);
    }
  }