# 🎓 AI Study Companion

> Your personal AI-powered study management system — organize smarter, revise better, and study with the power of AI.

---

## 📖 What is AI Study Companion?

AI Study Companion is a full-stack React web application designed to solve one of the biggest problems students face — **scattered, unstructured, and inefficient studying.**

Most students rely on basic to-do lists or paper planners. They forget what they studied, miss revision deadlines, and have no visibility into their weak areas. AI Study Companion brings everything together in one intelligent platform:

- Know exactly what you've studied and what's pending
- Get automatically reminded when to revise a topic
- Detect which topics you're struggling with
- Use AI to generate quizzes, explanations, and flashcards instantly
- Track your productivity patterns over time

---

## ✨ Feature Breakdown

### 📚 Subject & Topic Management
Organize your entire syllabus in one place.

- Create subjects with a **name, description, and color label** so you can visually distinguish them
- Add multiple **topics** under each subject
- Assign each topic a **difficulty level** (Easy, Medium, Hard)
- Track topic status: `Not Started` → `In Progress` → `Completed` → `Needs Revision`
- Topics you struggle with are automatically flagged as **⚠️ Weak Topics** based on your revision history
- See a **progress bar** per subject showing how many topics are done

**How you benefit:** You always know exactly where you stand in every subject. No more guessing what's left to study.

---

### ✅ Task Manager
Never miss a study task again.

- Create tasks with a **title, subject, topic, deadline, and priority** (Low / Medium / High)
- Tasks are organized into smart tabs:
  - **All** — every task
  - **Pending** — tasks yet to be done
  - **Completed** — finished tasks
  - **Overdue** — tasks whose deadline has passed (auto-detected)
  - **Revision** — tasks marked for re-study
- **Search** tasks in real time using a debounced search bar
- **Filter** by subject or priority
- **Sort** by deadline, priority, or newest first
- Overdue tasks are highlighted in red automatically — no manual checking needed

**How you benefit:** You get a clear, prioritized view of everything you need to do, with automatic overdue detection so nothing slips through the cracks.

---

### 📊 Dashboard
Your study progress at a glance.

- See key stats instantly: total topics, completed, needs revision, total tasks, pending, overdue
- **Overall completion percentage** with a progress bar
- **Subject Progress Chart** — a bar chart showing completed vs total topics per subject, built with Recharts
- **Productivity Insights** — the app analyzes your study patterns and tells you:
  - Which day of the week you study most
  - Whether your consistency dropped this week
  - How many sessions you've logged this week
  - Whether you have weak topics that need attention
  - Whether you have overdue tasks piling up
- **Weak Topics panel** — lists all topics flagged as struggling, with a direct link to the Revision Planner
- **Revision Due Soon panel** — shows topics whose 3-day revision window is approaching

**How you benefit:** Instead of manually tracking your progress, the dashboard gives you an intelligent summary of your entire study situation in seconds.

---

### 🔁 Revision Planner
Study science built into your workflow.

The Revision Planner is based on the **Ebbinghaus Forgetting Curve** — a scientifically proven concept that says you forget 70% of what you learn within 24 hours unless you revise it at the right time.

- When you mark a topic as **Completed**, the app **automatically schedules a revision session 3 days later** — this is called **Spaced Repetition**
- A **visual calendar** shows exactly which days have revision sessions due — dates with pending revisions are marked with a dot
- Click any date on the calendar to see which topics are due that day
- **Overdue Revisions** panel — topics whose revision date has passed are listed here with a one-click "Mark Revised" button
- **Upcoming Revisions** — shows all topics due in the next 7 days so you can plan ahead
- **Weak Topics panel** — all topics manually flagged as "Needs Revision" are listed here for quick access
- Mark any topic as revised with one click — it updates across the entire app instantly

**How you benefit:** You never have to manually plan when to revise. The app does it for you using proven study science, so you retain more of what you learn with less effort.

---

### 🤖 AI Study Tools
Three powerful AI modes powered by Google Gemini.

#### 🧠 Quiz Me
Enter any topic and the AI generates **5 multiple choice questions** with 4 options each and clearly marked correct answers.

- Great for self-testing before exams
- Works on any topic — programming, science, history, anything
- Select a subject to automatically log a study session for productivity tracking

**Example:** Type "Binary Trees" → get 5 MCQs on traversal, insertion, deletion, height, and types. Choose your options and get your score at the end.

---

#### 💡 Explain Simply
Enter any topic and the AI explains it **as if you're a complete beginner** — using analogies, real-world examples, and simple language.

- Perfect when you're stuck on a concept and textbooks aren't helping
- No jargon, no complexity — just clear understanding
- Great for building intuition before diving into technical details

**Example:** Type "Recursion" → get an explanation using a mirror-in-a-mirror analogy with step-by-step breakdown.

---

#### 🃏 Flashcards
Enter any topic and the AI generates **6 interactive flashcards** with a question on the front and answer on the back.

- Click any card to flip it and reveal the answer
- Perfect for quick revision sessions
- Covers key terms, definitions, and concepts

**Example:** Type "Operating System" → get flashcards on Process, Thread, Deadlock, Paging, Scheduling, and Semaphore.

---

#### 🔁 Test Me Again Later
After generating any AI content, click **"Test Me Again Later"** to:
- Save the topic to your Revision Planner automatically
- Flag it as "Needs Revision" in your subjects list
- Get reminded to come back to it

**How you benefit:** The AI tools aren't just a one-time generator — they connect directly to your revision schedule and subject tracker, making your entire study workflow intelligent and connected.

---

### 🌙 Dark Mode
- Toggle between light and dark themes with one click
- Your preference is saved — it persists even after you close the browser
- Easy on the eyes during late night study sessions

---

### 💾 Persistent Storage
- All your data — subjects, topics, tasks, revision schedules, study sessions — is saved in your browser's localStorage
- Nothing gets lost when you refresh or close the tab
- No account or login required

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | Core UI framework |
| React Router DOM | Multi-page navigation (SPA) |
| Context API | Global state management |
| localStorage | Persistent data storage |
| Google Gemini AI | AI quiz, explain, flashcard generation |
| Axios | API requests |
| Recharts | Progress bar charts |
| Framer Motion | Smooth animations |
| React Calendar | Revision calendar view |
| date-fns | Date calculations and formatting |
| React Toastify | Toast notifications |
| React Icons | Icon library |

---

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
- Derived State — computing stats from raw data without extra state

## 👨‍💻 Author

**Sohangi Singh**
[GitHub](https://github.com/Sohangi-Singh) · [LinkedIn](https://www.linkedin.com/in/sohangi-singh-b43232373/)
