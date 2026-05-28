# PROJECT OVERVIEW
- **Project Name:** CollegeFinder
- **Goal:** Help students discover, filter, compare, and save college options efficiently.
- **Core Problem Solved:** Fragmented college search experience; provides a unified platform for college insights.
- **Target Users:** High school students, college transfers, and career counselors.
- **Main Features:** College browsing/filtering, quick search, category rankings, favorites management, recently viewed, compare tool, user profile, local auth flow, light/dark themes.
- **Non-Functional Requirements:** Responsive design, fast load times (static frontend), accessible UI (accessibility.css), graceful error handling.

# TECH STACK
- **Frontend:** HTML5, Vanilla JavaScript (ES6 Modules)
- **Backend:** None (Mocked via `data.js` and `api.js`)
- **Database:** LocalStorage (Session, Auth, Favorites, Recents)
- **Authentication:** LocalStorage token/session-based (Mocked)
- **State Management:** LocalStorage + In-memory JS variables
- **Storage:** Local file system (Assets)
- **Deployment:** Static hosting (Vercel/Netlify/GitHub Pages)
- **Dev Tools:** VS Code Live Server, Python HTTP, Node Serve
- **Testing:** Manual (Browser)
- **AI/ML:** None

# HIGH LEVEL ARCHITECTURE
```text
[ Client Browser ]
      |
      v
[ UI Layer (HTML + CSS) ] <--> [ App Logic (app.js) ]
                                      |
      +-------------------------------+-------------------------------+
      v                               v                               v
[ Auth (storage.js) ]      [ Features (compare, filter) ]    [ Data Layer (data.js, api.js) ]
      |                               |                               |
      v                               v                               v
[ LocalStorage API ]       [ In-memory State ]               [ Static Mock Data ]
```

# SYSTEM FLOW
- **User Flow:** Landing (index.html) -> Browse/Search -> (Auth Check) -> View Details (college.html) / Add to Favorites -> View Profile/Rankings.
- **Internal Data Flow:** UI Event -> app.js -> (If Data Needed) api.js -> data.js -> (If state changed) storage.js -> Update UI.

# MODULE BREAKDOWN
- **app.js**
  - **Purpose:** Main application controller and UI event binder.
  - **Dependencies:** api, storage, toast, ui components.
- **data.js**
  - **Purpose:** Serves as the mock database containing college objects.
- **api.js**
  - **Purpose:** Mock API layer to fetch/filter data asynchronously.
  - **Dependencies:** data.js.
- **storage.js**
  - **Purpose:** Handles all LocalStorage read/write (auth, favorites).
- **filter.js**
  - **Purpose:** Logic for sorting and filtering college lists.
- **compare.js**
  - **Purpose:** Manages state and logic for side-by-side college comparisons.
- **recommend.js**
  - **Purpose:** Suggests colleges based on user profile/history.
- **recent.js**
  - **Purpose:** Tracks and retrieves recently viewed colleges.
- **toast.js**
  - **Purpose:** Reusable UI notification system.

# FRONTEND STRUCTURE
- **Pages:**
  - `index.html`: Landing & general browse.
  - `college.html`: Detailed individual view (Protected/Semi-protected).
  - `favorites.html`: User saved lists (Protected).
  - `rankings.html`: Categorized lists.
  - `profile.html`: User settings/stats (Protected).
  - `about.html`: Static info.
- **CSS Architecture:**
  - `style.css`: Core design system, tokens, layouts, utilities.
  - `accessibility.css`: A11y overrides, high-contrast, motion reduction.

# BACKEND STRUCTURE
*(Simulated via Frontend Modules)*
- **Service Layers:** `api.js`
- **Controllers:** `app.js`
- **Middleware:** Route guards via JS (`storage.isAuthenticated()`).
- **Authentication Flow:** Modal UI -> save to LocalStorage -> redirect.

# DATABASE DESIGN
*(LocalStorage Collections)*
- `user_session`: { token, username, email, loggedInAt }
- `user_favorites`: Array of college IDs.
- `recent_views`: Array of college IDs (capped at N).

# API STRUCTURE
*(Mocked in `api.js`)*
- `getColleges(filters)`: Returns array of colleges.
- `getCollegeById(id)`: Returns single college object.
- `searchColleges(query)`: Returns matched colleges.
- `authenticateUser(credentials)`: Returns mock token.

# STATE MANAGEMENT PLAN
- **Global State:** Auth status (checked via `storage.js` on page load).
- **Local State:** Filter criteria, current search query, compare drawer state.
- **Persistence Strategy:** LocalStorage.

# AUTHENTICATION & AUTHORIZATION
- **Login Flow:** UI Modal -> validate -> set LocalStorage session -> reload/update UI.
- **Token Strategy:** Mock token stored in LocalStorage.
- **Session Handling:** Cleared on explicit logout.
- **Role Permissions:** Unauthenticated (read public), Authenticated (read private, write favorites).
- **Security Considerations:** None (Mocked frontend environment).

# FILE/FOLDER STRUCTURE
```text
collegefinder/
├── index.html, college.html, etc. (Views)
├── css/
│   ├── style.css (Design System)
│   └── accessibility.css (A11y)
├── js/
│   ├── app.js (Main Controller)
│   ├── api.js, data.js (Data Layer)
│   ├── storage.js (Auth/Persistence)
│   └── compare.js, filter.js, recommend.js, recent.js, toast.js (Features)
└── assets/ (Images/Icons)
```

# CONFIGURATION MANAGEMENT
- **Environment Variables:** None (Frontend static).
- **Build Config:** None (Vanilla JS).

# PERFORMANCE OPTIMIZATION
- **Frontend:** Vanilla JS (zero overhead), CSS variables for quick theme switching.
- **Caching:** LocalStorage caching for recent views and favorites.
- **Network:** Mocked, zero latency (in future, implement ETags/Cache-Control).

# SCALABILITY PLAN
- **Horizontal Scaling:** Deploy via CDN (Vercel/Netlify).
- **Microservice Migration Plan:** Replace `api.js` calls with real fetch/axios calls to a REST/GraphQL backend (Node.js/Go) and replace `data.js` with a real Database (PostgreSQL/MongoDB).

# DEVELOPMENT RULES
- **Naming Conventions:** camelCase for variables/functions, PascalCase for classes (if any).
- **Code Standards:** ES6 Modules, strict mode, DOM manipulations centralized in `app.js`.
- **Component Rules:** Modular JS files for independent features.
- **API Rules:** All data fetching MUST pass through `api.js` (no direct `data.js` imports in views).

# TESTING STRATEGY
- **Unit Testing:** Jest (Recommended for future) for `filter.js`, `storage.js`.
- **E2E Testing:** Cypress/Playwright (Recommended for user flows like auth/favorites).

# DEVOPS & DEPLOYMENT
- **CI/CD Flow:** GitHub Actions -> Vercel/Netlify preview environments.
- **Hosting:** Static CDN.
- **Monitoring:** Sentry (Recommended future addition).

# KNOWN RISKS
- **Technical Risks:** LocalStorage limit (5MB) restricting favorite/recent list sizes.
- **Security Risks:** Client-side auth is inherently insecure (mock only).
- **Mitigation Strategy:** Migrate to real backend and HttpOnly cookies for session management.

# FUTURE FEATURES
- Real backend integration.
- JWT Authentication.
- Advanced AI-driven recommendations.
- User reviews and ratings.
- College application tracker.

# AI CONTEXT SUMMARY
**Project Essence:** Vanilla JS frontend-only college discovery app using LocalStorage for mocked state/auth.
**Architecture:** Static HTML -> `app.js` (Controller) -> `api.js`/`storage.js` -> `data.js` (Mock DB).
**Core Flows:** Browse -> Filter -> Compare -> Auth Check -> Save Favorite.
**Stack:** HTML5, CSS3 (Custom Design System), ES6 Modules, LocalStorage.
**Critical Rules:** Route data requests via `api.js`, maintain modular feature files, respect A11y constraints in `accessibility.css`. Keep UI logic in `app.js`. No backend exists yet.
