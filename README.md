# 🎓 CollegeFinder

![CollegeFinder Banner](https://img.shields.io/badge/Project-CollegeFinder-00113a?style=for-the-badge)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**CollegeFinder** is a modern, responsive, and blazing fast vanilla JavaScript web application designed to help students discover, filter, compare, and save their dream colleges across India. Built with clean code principles, it operates natively in the browser with **0 dependencies**, ensuring exceptional performance and reliability.

### 🌐 Live Demo
Experience the app instantly without any setup!
👉 **[View CollegeFinder Live](https://yourusername.github.io/collegefinder/)**  *(Replace with your actual GitHub Pages URL)*

---

## ✨ Key Features

*   **"Academic Ivory" Design System**: A premium, editorial-style user interface built entirely with custom CSS. It features glassmorphism, tonal depth layering, fluid typography (Manrope & Inter), and ambient soft shadows—moving away from traditional, rigid database styles.
*   **Advanced Filtering Engine**: Instantly filter across 100+ universities by Category (Engineering, Medical, Law, Arts), type (Govt/Private), fee ranges, and placement ratings.
*   **Search & Autocomplete**: Lightning-fast, debounced search that provides immediate matching for college names.
*   **Persistent Favorites Profile**: Save top choices directly to your browser's Local Storage. Your personalized dashboard tracks saved colleges and viewing history across sessions.
*   **Dynamic College Details**: Dedicated detail pages offering deep-dive stats, maps, infrastructure highlights, and smart recommendations based on browsing history.
*   **Theme Versatility**: A built-in Dark/Light mode toggle that seamlessly adapts the premium color palette and persists across reloads.
*   **Performance First**: Completely static routing, lazy-loaded images, and a highly optimized payload (~30KB gzipped).

---

## 🛠️ Tech Stack & Architecture

This project strictly adheres to **Vanilla Web Technologies** to master the fundamentals before moving to frameworks.

*   **DOM/Logic:** ES6+ Vanilla JavaScript (Modules, Event Delegation, Debouncing algorithms)
*   **Styling:** Custom Vanilla CSS3 (CSS Variables, Flexbox/Grid, Transform Animations, Backdrop-filters)
*   **State Management:** Native Web Storage API (`localStorage`)
*   **Data Source:** JSON-based client-side graph (`js/data.js`) with dynamically fetched Wikipedia imagery.
*   **A11y (Accessibility):** WCAG AA standards, semantic HTML structure, and screen-reader optimized elements.

---

## 📁 Repository Structure

```text
collegefinder/
├── 📄 index.html                 # Main Dashboard: Search, Filter, and Grid View
├── 📄 college.html               # Dynamic Detail View (renders via ?id= query param)
├── 📄 favorites.html             # Saved list interacting with Local Storage
├── 📄 profile.html               # Advanced user statistics and history
├── 📄 rankings.html              # Curated top lists and ranking dashboard
├── 📄 scholarships.html          # Secondary database for financial aid
├── 📄 trending.html              # Recently viewed and popular institutions
├── 📄 about.html                 # Project methodology and author details
│
├── 📁 css/
│   ├── 📄 style.css              # Global styles & "Academic Ivory" Design System
│   └── 📄 accessibility.css      # Screen reader only classes (.sr-only)
│
├── 📁 js/
│   ├── 📄 app.js                 # Primary Entry Point: routing, events, orchestration
│   ├── 📄 data.js                # Database arrays for Colleges and Scholarships
│   ├── 📄 filter.js              # Advanced array filtering/sorting algorithms
│   ├── 📄 storage.js             # LocalStorage wrapper utilities
│   ├── 📄 recommend.js           # Multi-factor similarity scoring mechanism
│   ├── 📄 compare.js             # Matrix generation for the Compare Modal
│   └── 📄 recent.js              # Ring-buffer logic for recently viewed queue
│
└── 📁 assets/                    # Static resources (images, icons)
```

---

## 🚀 How to Run Locally

Because this project uses ES6 Modules (`import/export`), you cannot simply double-click the `index.html` file (due to browser CORS policies). You must serve it over a local HTTP server.

**Option 1: Using VS Code Live Server (Recommended)**
1. Open the `collegefinder` folder in VS Code.
2. Install the `Live Server` extension.
3. Right-click on `index.html` and select **"Open with Live Server"**.

**Option 2: Using Python**
1. Ensure Python 3 is installed.
2. Open terminal in the project directory.
3. Run: `python -m http.server 8000`
4. Open your browser and navigate to `http://localhost:8000`.

**Option 3: Using Node.js**
1. Ensure Node is installed.
2. Run: `npx serve .`

---

## 🤝 Contributing

We welcome contributions to make CollegeFinder even better! Whether it's adding a new college to the dataset, refining the CSS animations, or optimizing the search algorithm. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions on the workflow.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Architected and developed by **Nitin Kumar Gupta**.*
