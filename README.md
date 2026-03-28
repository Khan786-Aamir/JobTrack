# ⚡ JobTrack AI — Full Stack AI-Powered Job Tracker

A complete job tracking application with AI resume matching, LangGraph-based assistant,
application pipeline management, and a polished dark-themed React UI.

---

## 📁 Folder Structure

```
job-tracker/
├── backend/
│   ├── data/
│   │   └── jobs.js              # 12 mock job listings
│   ├── routes/
│   │   ├── auth.js              # POST /login, GET /me, POST /logout
│   │   ├── resume.js            # POST /upload-resume, GET /resume, DELETE /resume
│   │   ├── jobs.js              # GET /jobs, GET /jobs/:id
│   │   ├── match.js             # POST /match, POST /match-all (AI matching)
│   │   ├── apply.js             # POST /apply, GET /applications, PATCH, DELETE
│   │   └── assistant.js         # POST /assistant (LangGraph intent router)
│   ├── store.js                 # In-memory store (resume, applications, sessions)
│   ├── server.js                # Fastify app entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx          # Nav, resume upload, stats
    │   │   ├── Filters.jsx          # All filters (search, type, mode, skills, score)
    │   │   ├── JobList.jsx          # Jobs grid
    │   │   ├── JobCard.jsx          # Individual job card with AI score
    │   │   ├── BestMatches.jsx      # Top matches horizontal scroll
    │   │   ├── ScoreBadge.jsx       # Score ring + badge components
    │   │   ├── ApplyPopup.jsx       # "Did you apply?" modal
    │   │   ├── ApplicationDashboard.jsx  # Kanban + Timeline view
    │   │   └── Assistant.jsx        # Floating AI chat (LangGraph)
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   ├── store/index.js           # Zustand global state
    │   ├── utils/api.js             # All API calls
    │   ├── styles/globals.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure AI (optional but recommended)

```bash
cd backend
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

> Without an API key, the app uses smart heuristic scoring (still works great).

### 3. Run the backend

```bash
cd backend
node server.js
# → Server running on http://localhost:4000
```

### 4. Run the frontend

```bash
cd frontend
npx vite
# → App running on http://localhost:5173
```

---

## 🔐 Authentication

| Field    | Value            |
|----------|------------------|
| Email    | test@gmail.com   |
| Password | test@123         |

---

## 🔌 API Reference

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | /api/login            | Login with fixed credentials         |
| GET    | /api/me               | Verify session                       |
| POST   | /api/logout           | Destroy session                      |
| POST   | /api/upload-resume    | Upload PDF or TXT resume             |
| GET    | /api/resume           | Get resume info + preview            |
| DELETE | /api/resume           | Remove resume                        |
| GET    | /api/jobs             | Get jobs (with query filters)        |
| POST   | /api/match            | AI match single job                  |
| POST   | /api/match-all        | AI match all jobs at once            |
| POST   | /api/apply            | Save application status              |
| GET    | /api/applications     | Get all tracked applications         |
| PATCH  | /api/applications/:id | Update application status            |
| DELETE | /api/applications/:id | Remove application                   |
| POST   | /api/assistant        | LangGraph AI assistant               |

---

## 🧠 AI Architecture

### LangChain-style Matching (`/api/match-all`)

```
Resume Text + Job Description
        ↓
  Claude Haiku API
        ↓
  Structured JSON:
    - score (0–100)
    - skillsMatch
    - experienceMatch
    - keywordMatch
    - summary
        ↓
  Cached in memory
  Displayed on every card
```

**Score Colors:**
- 🟢 ≥ 70 — Great match (green)
- 🟡 40–69 — Fair match (yellow)  
- ⚫ < 40 — Weak match (gray)

### LangGraph-style Intent Detection (`/api/assistant`)

```
User Message
     ↓
Intent Detection (regex + keyword routing)
     ↓
Node Execution:
  SHOW_REMOTE       → set workMode filter
  FILTER_BY_SKILL   → extract + set skills filter
  FILTER_BY_LOCATION→ set location filter
  SHOW_MATCHES      → sort by score
  SHOW_APPLICATIONS → switch to dashboard view
  RESUME_HELP       → check resume status
  GENERAL_QUESTION  → Claude API fallback
     ↓
Response + FilterUpdate payload
     ↓
Frontend applies filters automatically
```

**Example commands:**
```
"Show remote React jobs"        → workMode=remote, skills=React
"Find Python ML jobs"           → skills=Python,Machine Learning
"Show my best matches"          → sort by score
"Jobs in New York"              → location=New York
"Show my applications"          → switch to dashboard
```

---

## 🎨 Features Overview

| Feature                | Details                                               |
|------------------------|-------------------------------------------------------|
| Auth                   | Token-based session, fixed demo credentials           |
| Resume Upload          | PDF + TXT, text extraction, replace anytime           |
| Job Feed               | 12 realistic mock jobs, filterable                    |
| AI Matching            | Claude Haiku or heuristic fallback, scores all jobs   |
| Score Display          | Ring + badge on every card, highlighted matched skills|
| Best Matches           | Top 8 sorted by score in horizontal scroll            |
| Filters                | Search, type, mode, location, skills, date, min score |
| Apply Flow             | Opens link → popup → saves status + timestamp        |
| Application Dashboard  | Kanban board + timeline with status history           |
| AI Assistant           | Floating chat, updates filters automatically          |

---

## 🔧 Customization

### Add real jobs (Adzuna API)
Replace the `GET /api/jobs` route to call the Adzuna API:
```js
const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=...&app_key=...`)
```

### Switch to OpenAI/Gemini
In `match.js` and `assistant.js`, replace the Anthropic fetch with:
```js
// OpenAI
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({ model: 'gpt-4o-mini', messages: [...] })
})
```

### Persist data (SQLite)
Replace `store.js` with better-sqlite3:
```js
import Database from 'better-sqlite3'
const db = new Database('jobtracker.db')
```

---

## 📋 Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React 18, React Router, Zustand, Vite     |
| Backend    | Node.js, Fastify 4                        |
| AI Matching| Claude Haiku (Anthropic) via REST API     |
| AI Agent   | LangGraph-style intent router (custom)    |
| Storage    | In-memory (easily swappable to SQLite/PG) |
| Styling    | Pure CSS-in-JS, CSS variables, animations |
| Fonts      | Sora + JetBrains Mono                     |
