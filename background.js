// Background script for Dark Pattern Detector

// Store detected patterns for each tab
const tabPatterns = {}

// Initialize default settings if not already set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["highlightPatterns", "showNotifications"], (result) => {
    if (result.highlightPatterns === undefined) {
      chrome.storage.sync.set({ highlightPatterns: true })
    }
    if (result.showNotifications === undefined) {
      chrome.storage.sync.set({ showNotifications: true })
    }
  })
})

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "patternsDetected") {
    const tabId = sender.tab.id

    // Store patterns for this tab
    tabPatterns[tabId] = request.patterns

    // Update badge
    updateBadge(tabId, request.patterns.length)

    // Show notification if enabled and if there are patterns
    if (request.patterns.length > 0) {
      chrome.storage.sync.get(["showNotifications"], (result) => {
        if (result.showNotifications) {
          showNotification(request.patterns.length, sender.tab.url)
        }
      })
    }
  }

  return true
})

// Update badge when tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId

  if (tabPatterns[tabId]) {
    updateBadge(tabId, tabPatterns[tabId].length)
  } else {
    // Clear badge if no patterns detected for this tab
    chrome.action.setBadgeText({ text: "", tabId: tabId })
  }
})

// Clear patterns when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabPatterns[tabId]) {
    delete tabPatterns[tabId]
  }
})

// Function to update the extension badge
function updateBadge(tabId, patternCount) {
  if (patternCount > 0) {
    chrome.action.setBadgeText({ text: patternCount.toString(), tabId: tabId })
    chrome.action.setBadgeBackgroundColor({ color: "#ff6b6b", tabId: tabId })
  } else {
    chrome.action.setBadgeText({ text: "", tabId: tabId })
  }
}

// Function to show a notification
function showNotification(patternCount, url) {
  // Extract domain from URL
  const domain = new URL(url).hostname

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Dark Patterns Detected",
    message: `Found ${patternCount} potential dark pattern${patternCount > 1 ? "s" : ""} on ${domain}`,
    priority: 1,
  })
}
