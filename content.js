// Dark pattern detector content script

// Store detected patterns
let detectedPatterns = []
let highlightEnabled = true

// Initialize when the page is loaded
window.addEventListener("load", () => {
  // Load settings
  chrome.storage.sync.get(["highlightPatterns"], (result) => {
    highlightEnabled = result.highlightPatterns !== false // Default to true

    // Start detection
    detectDarkPatterns()

    // Set up mutation observer to detect dynamic content changes
    observeDOMChanges()
  })
})

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPatterns") {
    sendResponse({ patterns: detectedPatterns })
  } else if (request.action === "updateHighlighting") {
    highlightEnabled = request.highlight

    // Remove existing highlights if disabled
    if (!highlightEnabled) {
      removeHighlights()
    } else {
      // Re-apply highlights
      highlightDarkPatterns()
    }
  }
  return true
})

// Function to detect dark patterns on the page
function detectDarkPatterns() {
  detectedPatterns = []

  // Check for each type of dark pattern
  checkFalseUrgency()
  checkBasketSneaking()
  checkConfirmShaming()
  checkForcedAction()
  checkSubscriptionTrap()
  checkInterfaceInterference()
  checkBaitAndSwitch()
  checkDripPricing()
  checkDisguisedAdvertisement()
  checkNagging()

  // Highlight patterns if enabled
  if (highlightEnabled && detectedPatterns.length > 0) {
    highlightDarkPatterns()
  }

  // Notify background script about detected patterns
  chrome.runtime.sendMessage({
    action: "patternsDetected",
    patterns: detectedPatterns,
    url: window.location.href,
  })
}

// Set up mutation observer to detect dynamic content changes
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    // Debounce to avoid excessive processing
    clearTimeout(observerTimeout)
    observerTimeout = setTimeout(() => {
      detectDarkPatterns()
    }, 1000)
  })

  let observerTimeout

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })
}

// Function to highlight dark patterns on the page
function highlightDarkPatterns() {
  // Remove existing highlights first
  removeHighlights()

  // Add new highlights
  detectedPatterns.forEach((pattern) => {
    if (pattern.elements && pattern.elements.length > 0) {
      pattern.elements.forEach((element) => {
        highlightElement(element, pattern.type)
      })
    }
  })
}

// Function to highlight a specific element
function highlightElement(element, patternType) {
  if (!element || !element.classList) return

  // Add highlight class
  element.classList.add("dark-pattern-highlight")

  // Add data attribute for pattern type
  element.setAttribute("data-pattern-type", patternType)

  // Create tooltip
  const tooltip = document.createElement("div")
  tooltip.className = "dark-pattern-tooltip"
  tooltip.textContent = `Dark Pattern: ${patternType}`

  // Position the tooltip
  element.style.position = element.style.position || "relative"
  element.appendChild(tooltip)

  // Add event listeners for tooltip visibility
  element.addEventListener("mouseenter", () => {
    tooltip.style.display = "block"
  })

  element.addEventListener("mouseleave", () => {
    tooltip.style.display = "none"
  })
}

// Function to remove all highlights
function removeHighlights() {
  const highlightedElements = document.querySelectorAll(".dark-pattern-highlight")
  highlightedElements.forEach((element) => {
    element.classList.remove("dark-pattern-highlight")
    element.removeAttribute("data-pattern-type")

    // Remove tooltips
    const tooltips = element.querySelectorAll(".dark-pattern-tooltip")
    tooltips.forEach((tooltip) => tooltip.remove())
  })
}

// Pattern detection functions

function checkFalseUrgency() {
  // Look for countdown timers
  const timers = document.querySelectorAll('[class*="countdown"], [class*="timer"], [id*="countdown"], [id*="timer"]')

  // Look for urgency phrases
  const urgencyPhrases = [
    "limited time",
    "ends soon",
    "act now",
    "hurry",
    "last chance",
    "only today",
    "offer expires",
    "while supplies last",
    "almost gone",
    "selling fast",
  ]

  const textNodes = getAllTextNodes(document.body)
  const urgencyTextNodes = textNodes.filter((node) => {
    const text = node.textContent.toLowerCase()
    return urgencyPhrases.some((phrase) => text.includes(phrase))
  })

  if (timers.length > 0 || urgencyTextNodes.length > 0) {
    const elements = [...Array.from(timers), ...urgencyTextNodes.map((node) => node.parentElement)]
    detectedPatterns.push({
      type: "False Urgency",
      description: "Creating a false sense of urgency to pressure users into making quick decisions.",
      elements: elements,
    })
  }
}

function checkBasketSneaking() {
  // Check for items added to cart automatically
  // This is harder to detect automatically, but we can look for certain patterns

  // Look for checkboxes that are pre-checked for additional items
  const preCheckedBoxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(
    (checkbox) =>
      checkbox.checked &&
      (checkbox.closest("form") ||
        checkbox.closest('[class*="cart"], [class*="basket"], [id*="cart"], [id*="basket"]')),
  )

  if (preCheckedBoxes.length > 0) {
    detectedPatterns.push({
      type: "Basket Sneaking",
      description: "Adding items to your cart without explicit consent.",
      elements: preCheckedBoxes,
    })
  }
}

function checkConfirmShaming() {
  // Look for guilt-inducing language in buttons or links
  const shamePhrases = [
    "no thanks",
    "i don't want",
    "not interested",
    "no, i prefer",
    "i'll risk it",
    "i don't care",
    "skip",
    "maybe later",
  ]

  const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'))
  const shamingButtons = buttons.filter((button) => {
    const text = button.textContent.toLowerCase()
    return shamePhrases.some((phrase) => text.includes(phrase))
  })

  if (shamingButtons.length > 0) {
    detectedPatterns.push({
      type: "Confirm Shaming",
      description: "Using guilt or shame to discourage certain user choices.",
      elements: shamingButtons,
    })
  }
}

function checkForcedAction() {
  // Look for forced account creation or social media sharing
  const forcedPhrases = [
    "create account to continue",
    "sign up to view",
    "login to see",
    "share to unlock",
    "connect with facebook",
  ]

  const textNodes = getAllTextNodes(document.body)
  const forcedTextNodes = textNodes.filter((node) => {
    const text = node.textContent.toLowerCase()
    return forcedPhrases.some((phrase) => text.includes(phrase))
  })

  // Check for disabled "skip" or "no thanks" options
  const disabledSkips = Array.from(document.querySelectorAll('button[disabled], a[aria-disabled="true"]')).filter(
    (el) => {
      const text = el.textContent.toLowerCase()
      return text.includes("skip") || text.includes("no thanks") || text.includes("later")
    },
  )

  if (forcedTextNodes.length > 0 || disabledSkips.length > 0) {
    const elements = [...forcedTextNodes.map((node) => node.parentElement), ...disabledSkips]
    detectedPatterns.push({
      type: "Forced Action",
      description: "Requiring users to perform unwanted actions to complete their intended task.",
      elements: elements,
    })
  }
}

function checkSubscriptionTrap() {
  // Look for hard-to-find unsubscribe options
  const subscriptionPhrases = [
    "automatic renewal",
    "automatically renew",
    "subscription will renew",
    "billed automatically",
  ]

  const textNodes = getAllTextNodes(document.body)
  const subscriptionTextNodes = textNodes.filter((node) => {
    const text = node.textContent.toLowerCase()
    return subscriptionPhrases.some((phrase) => text.includes(phrase))
  })

  // Look for small print about subscription terms
  const smallPrint = Array.from(document.querySelectorAll('small, .small, [class*="fine-print"], [class*="terms"]'))
  const subscriptionSmallPrint = smallPrint.filter((el) => {
    const text = el.textContent.toLowerCase()
    return subscriptionPhrases.some((phrase) => text.includes(phrase))
  })

  if (subscriptionTextNodes.length > 0 || subscriptionSmallPrint.length > 0) {
    const elements = [...subscriptionTextNodes.map((node) => node.parentElement), ...subscriptionSmallPrint]
    detectedPatterns.push({
      type: "Subscription Trap",
      description: "Making it difficult to unsubscribe from services or hiding automatic renewal terms.",
      elements: elements,
    })
  }
}

function checkInterfaceInterference() {
  // Look for misleading buttons or visual hierarchy issues

  // Check for multiple buttons where the visually prominent one is not the user's likely choice
  const buttons = Array.from(document.querySelectorAll('button, a.button, [role="button"], .btn'))

  // Group buttons that are close to each other
  const buttonGroups = groupElementsByProximity(buttons)

  // Check each group for potential interference
  let interferenceElements = []
  buttonGroups.forEach((group) => {
    if (group.length >= 2) {
      // Check if there's a visually prominent button that might be misleading
      const prominentButtons = group.filter((button) => {
        const styles = window.getComputedStyle(button)
        const isLarge = Number.parseInt(styles.width) > 150 || Number.parseInt(styles.height) > 50
        const isColorful = !["transparent", "white", "#fff", "#ffffff", "rgb(255, 255, 255)"].includes(
          styles.backgroundColor.toLowerCase(),
        )
        return isLarge || isColorful
      })

      if (prominentButtons.length > 0) {
        // Check if the prominent button is likely not the user's primary choice
        const buttonTexts = prominentButtons.map((b) => b.textContent.toLowerCase())
        const isLikelyInterference = buttonTexts.some(
          (text) =>
            text.includes("subscribe") ||
            text.includes("upgrade") ||
            text.includes("premium") ||
            text.includes("accept all"),
        )

        if (isLikelyInterference) {
          interferenceElements = [...interferenceElements, ...prominentButtons]
        }
      }
    }
  })

  // Check for visually hidden or hard-to-see options
  const smallOptions = Array.from(document.querySelectorAll("a, button, input")).filter((el) => {
    const styles = window.getComputedStyle(el)
    const isSmall = Number.parseInt(styles.fontSize) < 11
    const isLowContrast = isLowContrastColor(styles.color, styles.backgroundColor)
    return (isSmall || isLowContrast) && !el.closest("nav, footer")
  })

  if (interferenceElements.length > 0 || smallOptions.length > 0) {
    const elements = [...interferenceElements, ...smallOptions]
    detectedPatterns.push({
      type: "Interface Interference",
      description: "Manipulating the interface to guide users toward certain choices or hide alternatives.",
      elements: elements,
    })
  }
}

function checkBaitAndSwitch() {
  // This is hard to detect automatically, but we can look for certain patterns

  // Look for crossed-out prices with significantly higher values
  const prices = Array.from(document.querySelectorAll('[class*="price"], [class*="cost"]'))
  const baitPrices = prices.filter((el) => {
    const text = el.textContent
    // Look for struck-through text or "was" pricing
    return el.querySelector("del, strike, s") !== null || /was\s+[$£€]/.test(text.toLowerCase())
  })

  if (baitPrices.length > 0) {
    detectedPatterns.push({
      type: "Potential Bait and Switch",
      description: "Advertising one thing but delivering another, or using misleading pricing.",
      elements: baitPrices,
    })
  }
}

function checkDripPricing() {
  // Look for additional fees added during checkout
  const feePhrases = ["processing fee", "service fee", "convenience fee", "booking fee", "facility fee", "handling fee"]

  const textNodes = getAllTextNodes(document.body)
  const feeTextNodes = textNodes.filter((node) => {
    const text = node.textContent.toLowerCase()
    return feePhrases.some((phrase) => text.includes(phrase))
  })

  // Look for price increases in checkout flow
  const checkoutContainer = document.querySelector(
    '[class*="checkout"], [id*="checkout"], [class*="cart"], [id*="cart"]',
  )
  let dripElements = []

  if (checkoutContainer) {
    const priceElements = checkoutContainer.querySelectorAll('[class*="price"], [class*="total"], [class*="fee"]')
    dripElements = Array.from(priceElements)
  }

  if (feeTextNodes.length > 0 || dripElements.length > 0) {
    const elements = [...feeTextNodes.map((node) => node.parentElement), ...dripElements]
    detectedPatterns.push({
      type: "Drip Pricing",
      description: "Revealing additional costs gradually during the checkout process.",
      elements: elements,
    })
  }
}

function checkDisguisedAdvertisement() {
  // Look for elements that look like content but are ads

  // Check for sponsored content that's not clearly labeled
  const contentElements = document.querySelectorAll('article, .post, [class*="content"], [class*="card"]')
  const disguisedAds = Array.from(contentElements).filter((el) => {
    // Look for small "sponsored" or "ad" labels
    const text = el.textContent.toLowerCase()
    const hasAdLabel = /(^|\s)(sponsored|advertisement|promoted|ad)(\s|$)/.test(text)

    // Check if it has outbound links that look like ads
    const links = el.querySelectorAll('a[href*="click"], a[href*="sponsor"], a[href*="affiliate"], a[href*="partner"]')

    return (hasAdLabel && el.querySelector("small, .small") !== null) || links.length > 0
  })

  // Check for native ads (ads that match the site's design)
  const possibleNativeAds = Array.from(
    document.querySelectorAll('[id*="ad-"], [class*="ad-"], [id*="sponsor"], [class*="sponsor"]'),
  ).filter((el) => !el.matches("script, style, meta, link"))

  if (disguisedAds.length > 0 || possibleNativeAds.length > 0) {
    const elements = [...disguisedAds, ...possibleNativeAds]
    detectedPatterns.push({
      type: "Disguised Advertisement",
      description: "Ads that don't look like ads or sponsored content that's not clearly labeled.",
      elements: elements,
    })
  }
}

function checkNagging() {
  // Look for repeated prompts or popups

  // Check for newsletter popups, cookie notices, app download prompts, etc.
  const naggingElements = [
    ...document.querySelectorAll('[class*="popup"], [class*="modal"], [class*="overlay"], [class*="banner"]'),
    ...document.querySelectorAll('[id*="popup"], [id*="modal"], [id*="overlay"], [id*="banner"]'),
  ].filter((el) => {
    // Filter out elements that are not visible
    const styles = window.getComputedStyle(el)
    return styles.display !== "none" && styles.visibility !== "hidden" && styles.opacity !== "0"
  })

  if (naggingElements.length > 0) {
    detectedPatterns.push({
      type: "Nagging",
      description: "Repeatedly prompting users for the same action or showing intrusive popups.",
      elements: naggingElements,
    })
  }
}

// Helper functions

// Get all text nodes in an element
function getAllTextNodes(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  })

  const textNodes = []
  let node
  while ((node = walker.nextNode())) {
    textNodes.push(node)
  }

  return textNodes
}

// Group elements that are close to each other
function groupElementsByProximity(elements) {
  const groups = []
  const processed = new Set()

  elements.forEach((element) => {
    if (processed.has(element)) return

    const rect = element.getBoundingClientRect()
    const group = [element]
    processed.add(element)

    elements.forEach((otherElement) => {
      if (element === otherElement || processed.has(otherElement)) return

      const otherRect = otherElement.getBoundingClientRect()

      // Check if elements are close to each other (within 50px)
      const isClose =
        Math.abs(rect.left - otherRect.left) < 50 ||
        Math.abs(rect.right - otherRect.right) < 50 ||
        Math.abs(rect.top - otherRect.top) < 50 ||
        Math.abs(rect.bottom - otherRect.bottom) < 50

      if (isClose) {
        group.push(otherElement)
        processed.add(otherElement)
      }
    })

    groups.push(group)
  })

  return groups
}

// Check if two colors have low contrast
function isLowContrastColor(foreground, background) {
  // Convert colors to RGB
  const fgRGB = colorToRGB(foreground)
  const bgRGB = colorToRGB(background)

  if (!fgRGB || !bgRGB) return false

  // Calculate relative luminance
  const fgLuminance = calculateLuminance(fgRGB)
  const bgLuminance = calculateLuminance(bgRGB)

  // Calculate contrast ratio
  const contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)

  // WCAG 2.0 recommends a contrast ratio of at least 4.5:1 for normal text
  return contrastRatio < 4.5
}

// Convert color string to RGB values
function colorToRGB(color) {
  if (!color || color === "transparent") return null

  // For named colors and hex
  const tempEl = document.createElement("div")
  tempEl.style.color = color
  document.body.appendChild(tempEl)
  const computedColor = window.getComputedStyle(tempEl).color
  document.body.removeChild(tempEl)

  // Parse RGB values
  const match = computedColor.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
  if (match) {
    return {
      r: Number.parseInt(match[1]),
      g: Number.parseInt(match[2]),
      b: Number.parseInt(match[3]),
    }
  }

  return null
}

// Calculate luminance from RGB values
function calculateLuminance(rgb) {
  // Convert RGB to relative luminance using the formula from WCAG 2.0
  const { r, g, b } = rgb

  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  const rLuminance = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLuminance = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLuminance = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * rLuminance + 0.7152 * gLuminance + 0.0722 * bLuminance
}
