# 🎓 AI Study Companion

An AI-powered study management system built with React that helps students organize subjects, track progress, plan revisions, and get AI-generated study help.

## 🚀 Live Demo
[View Live →](your-vercel-link-here)

## ✨ Features

- 📚 **Subject & Topic Management** — Organize subjects with color labels, add topics with difficulty levels and status tracking
- ✅ **Task Manager** — Create tasks with deadlines, priority levels, filters, sorting and tabs (Pending, Completed, Overdue)
- 📊 **Dashboard** — Visual progress charts, productivity insights, weak topic detection
- 🔁 **Revision Planner** — Spaced repetition system, auto-schedules revision 3 days after topic completion, calendar view
- 🤖 **AI Study Tools** — Quiz generator, simple explainer, flashcard generator powered by Google Gemini AI
- 🌙 **Dark Mode** — Persistent dark/light theme toggle
- 💾 **Persistent Storage** — All data saved in localStorage, survives page refresh

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router DOM | Client-side routing |
| Context API + localStorage | Global state management |
| Recharts | Progress charts |
| Framer Motion | Animations |
| React Calendar | Revision calendar |
| date-fns | Date calculations |
| React Toastify | Notifications |
| Google Gemini AI | AI study features |
| Axios | API calls |

## 📁 Project Structure
```
src/
├── components/        # Reusable UI components
├── context/           # React Context (global state)
│   └── StudyContext.jsx
├── hooks/             # Custom React hooks
│   ├── useSubjects.js
│   ├── useTasks.js
│   ├── useProgress.js
│   └── useDebounce.js
├── pages/             # Route pages
│   ├── Dashboard.jsx
│   ├── Subjects.jsx
│   ├── Tasks.jsx
│   ├── Revision.jsx
│   └── AITools.jsx
├── services/
│   └── aiService.js   # Gemini API integration
└── utils/
    └── helpers.js     # Shared utility functions
```

## ⚙️ Setup & Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-study-companion.git
cd ai-study-companion
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server
```bash
npm run dev
```

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click **Get API Key** → **Create API Key**
3. Copy and paste into your `.env` file

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats, charts, insights |
| `/subjects` | Subjects | Subject and topic management |
| `/tasks` | Tasks | Task creation and tracking |
| `/revision` | Revision Planner | Spaced repetition calendar |
| `/ai-tools` | AI Tools | Quiz, explain, flashcards |

## 🧠 React Concepts Used

- `useState` — local component state
- `useEffect` — side effects and localStorage sync
- `useContext` — consuming global state
- `createContext` — creating global state
- Custom Hooks — reusable logic extraction
- React Router DOM — SPA navigation
- Framer Motion — declarative animations

## 👨‍💻 Author

Sohangi Singh — [GitHub](https://github.com/YOUR_USERNAME)