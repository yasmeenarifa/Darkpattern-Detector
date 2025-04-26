document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const patternsList = document.getElementById("patterns-list")
  const statusIndicator = document.getElementById("status-indicator")
  const statusText = document.getElementById("status-text")
  const highlightToggle = document.getElementById("highlight-toggle")
  const notificationToggle = document.getElementById("notification-toggle")
  const reportBtn = document.getElementById("report-btn")

  // Get current tab and check for dark patterns
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]

    // Send message to content script to get detected patterns
    chrome.tabs.sendMessage(currentTab.id, { action: "getPatterns" }, (response) => {
      if (chrome.runtime.lastError) {
        // Handle error (page might not have loaded content script yet)
        statusIndicator.className = "scanning"
        statusText.textContent = "Waiting for page to load..."
        return
      }

      if (response && response.patterns) {
        updatePatternsList(response.patterns)
      }
    })
  })

  // Load saved settings
  chrome.storage.sync.get(["highlightPatterns", "showNotifications"], (result) => {
    highlightToggle.checked = result.highlightPatterns !== false // Default to true
    notificationToggle.checked = result.showNotifications !== false // Default to true
  })

  // Save settings when changed
  highlightToggle.addEventListener("change", () => {
    const isChecked = highlightToggle.checked
    chrome.storage.sync.set({ highlightPatterns: isChecked })

    // Send message to content script to update highlighting
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateHighlighting",
        highlight: isChecked,
      })
    })
  })

  notificationToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ showNotifications: notificationToggle.checked })
  })

  // Handle report button
  reportBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url
      // Open a new tab with a reporting form (could be a Google Form or your own reporting system)
      chrome.tabs.create({
        url: `https://example.com/report?url=${encodeURIComponent(url)}`,
      })
    })
  })

  // Function to update the patterns list in the popup
  function updatePatternsList(patterns) {
    patternsList.innerHTML = ""

    if (patterns.length === 0) {
      statusIndicator.className = "safe"
      statusText.textContent = "No dark patterns detected"

      const noPatterns = document.createElement("div")
      noPatterns.className = "no-patterns"
      noPatterns.textContent = "This page appears to be free of dark patterns!"
      patternsList.appendChild(noPatterns)
      return
    }

    statusIndicator.className = "warning"
    statusText.textContent = `${patterns.length} dark pattern${patterns.length > 1 ? "s" : ""} detected`

    patterns.forEach((pattern) => {
      const patternItem = document.createElement("div")
      patternItem.className = "pattern-item"

      const title = document.createElement("h3")
      title.textContent = pattern.type

      const description = document.createElement("p")
      description.textContent = pattern.description

      patternItem.appendChild(title)
      patternItem.appendChild(description)
      patternsList.appendChild(patternItem)
    })
  }
})
