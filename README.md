# CollegeFinder

CollegeFinder is a responsive, frontend-first web application that helps students discover colleges, filter options, compare institutes, save favorites, and view detailed college profiles.

LIVE DEMO: https://nitingupta05.github.io/college-finder/

## Overview

The project is built with Vanilla JavaScript, modular architecture, and a local-storage-based authentication/session system. It is designed to provide:

- Fast college browsing and filtering
- Protected detailed pages for authenticated users
- Personalized favorites and profile insights
- Clean, modern, responsive UI across devices

## Core Features

- College browsing with advanced filters
- Search with quick suggestions
- Ranking page by category and metrics
- Favorites management
- Recently viewed colleges
- Compare colleges (Browse page)
- Authentication (Sign Up / Sign In / Session persistence)
- Protected routes for restricted pages
- Light/Dark theme toggle

## Tech Stack

- HTML5
- CSS3 (custom design system, responsive breakpoints)
- JavaScript ES Modules
- LocalStorage (session/auth/favorites/recent data)

## Project Structure

```text
collegefinder/
├── index.html
├── college.html
├── favorites.html
├── rankings.html
├── profile.html
├── about.html
├── css/
│   ├── style.css
│   └── accessibility.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── data.js
│   ├── filter.js
│   ├── storage.js
│   ├── compare.js
│   ├── recommend.js
│   ├── recent.js
│   └── toast.js
└── README.md
```

## Local Setup

Because ES modules are used, run the project through a local server.

### Option 1: VS Code Live Server

1. Open the `collegefinder` folder in VS Code
2. Install Live Server extension
3. Open `index.html` with Live Server

### Option 2: Python

```bash
python -m http.server 8000
```

Open: `http://localhost:8000`

### Option 3: Node

```bash
npx serve .
```

## Authentication Notes

- New users can register from the modal auth flow
- Login creates a persisted session/token in `localStorage`
- Protected pages redirect unauthorized users to home with login prompt

## Quality & Reliability

The codebase includes:

- Route guarding for protected pages
- Loading and error states for key async flows
- Defensive rendering checks for null/invalid data
- Responsive layout for mobile/tablet/desktop

## Author

**Nitin Kumar Gupta**

- LinkedIn: https://www.linkedin.com/in/nitin-kumar-gupta-0a5567373/
- GitHub: https://github.com/NitinGupta05
- Email: nitinkumargupta515@gmail.com
