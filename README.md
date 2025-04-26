# Dark Pattern Detector

![Dark Pattern Detector Logo](icons/icon128.png)

## 🛡️ Protecting Users from Manipulative Design Practices

Dark Pattern Detector is a Chrome extension that helps users identify and avoid manipulative design practices on websites. Dark patterns are deceptive UX/UI tricks that websites use to manipulate users into making decisions they might not otherwise make, such as buying products, subscribing to services, or sharing personal data.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔍 What Are Dark Patterns?

Dark patterns have been defined as any practices or deceptive design patterns amounting to misleading advertisement, unfair trade practices, or violation of consumer rights. This extension detects the following types of dark patterns:

1. **False Urgency** - Creating a false sense of urgency to pressure users into making quick decisions
2. **Basket Sneaking** - Adding items to a user's cart without their explicit consent
3. **Confirm Shaming** - Using guilt or shame to discourage certain user choices
4. **Forced Action** - Requiring users to perform unwanted actions to complete their intended task
5. **Subscription Trap** - Making it difficult to unsubscribe from services
6. **Interface Interference** - Manipulating the interface to guide users toward certain choices
7. **Bait and Switch** - Advertising one thing but delivering another
8. **Drip Pricing** - Revealing additional costs gradually during the checkout process
9. **Disguised Advertisement** - Ads that don't look like ads
10. **Nagging** - Repeatedly prompting users for the same action

## ✨ Features

- **Real-time Detection**: Automatically scans websites for dark patterns as you browse
- **Visual Highlighting**: Highlights detected dark patterns directly on the webpage with color-coded borders
- **Informative Tooltips**: Shows tooltips explaining the type of dark pattern detected
- **Pattern Summary**: Provides a summary of all detected patterns in the extension popup
- **Customizable Settings**: Toggle highlighting and notifications on/off
- **Badge Counter**: Shows the number of detected patterns on the extension icon
- **Notifications**: Optional desktop notifications when dark patterns are detected

## 🛠️ Technology Stack

- **JavaScript**: Core programming language for extension functionality
- **Chrome Extension API**: For browser integration and extension functionality
- **HTML/CSS**: For the extension's popup interface and webpage highlighting
- **DOM Manipulation**: For analyzing webpage structure and detecting patterns
- **MutationObserver API**: For detecting dynamically loaded content
- **Chrome Storage API**: For saving user preferences
- **Chrome Notifications API**: For desktop notifications
- **React.js**: For future versions with more complex UI components (planned)

## 📋 Project Structure

```
dark-pattern-detector/
├── manifest.json        # Extension configuration
├── background.js        # Background script for extension
├── content.js           # Content script for analyzing webpages
├── content.css          # Styles for highlighting dark patterns
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── popup.css            # Popup styling
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🚀 Installation

