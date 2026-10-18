# TaskFlow — Focus on What Matters.

**A smarter way to organize your work, build focus, and understand your productivity.**

TaskFlow is a productivity and task management web application designed to bring your daily workflow into one place. Organize tasks, run focused work sessions, track personal goals, reflect on your progress, and get AI-powered productivity assistance through a single interface.

The goal is simple: spend less time managing your day and more time making progress.

---

## ✨ Features

### 📋 Task Management
- Create and manage daily tasks.
- Set task priorities and due dates.
- Mark tasks as complete and filter by status.
- Keep your task list organized and actionable.

### ⏱️ Focus Sessions
- Choose from dedicated focus and break timer modes.
- Start and reset sessions with simple controls.
- Build a more intentional work routine.

### 🎯 Daily Goals
- Set daily focus-hour targets.
- Track progress toward your goals.
- Monitor your daily productivity at a glance.

### 📊 Productivity Dashboard
- View task completion and focus statistics.
- Access a daily briefing and progress summaries.
- Review productivity insights in one place.

### 📝 Daily Reflection
- Compare planned hours with actual hours.
- Record daily reviews and personal wins.
- Reflect on what worked and what can improve.

### 🤖 AI Productivity Companion
- Interact with an AI assistant for productivity support.
- Send chat requests through a backend API.
- Integrate Google's Gemini API without exposing the API key in frontend code.

### 🌿 Calm Mode
- Access guided breathing exercises.
- Take a short pause when you need to reset and refocus.

---

## 🛠️ Built With

| Technology | Role |
|---|---|
| HTML5 | Application structure |
| CSS3 | UI design and responsive styling |
| JavaScript | Frontend interactions and logic |
| Node.js | Backend runtime |
| Express.js | API server |
| Google Gemini API | AI-powered assistance |
| localStorage | Browser-side data persistence |

---

## 📁 Project Structure

```text
TaskFlow/
├── index.html       # Application interface
├── style.css        # Design system and responsive styles
├── star.js          # Frontend logic and interactions
├── server.js        # Express server and AI endpoint
├── package.json     # Dependencies and npm scripts
├── package-lock.json
├── .env             # Local environment variables
└── .gitignore       # Files excluded from Git
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A Gemini API key for AI chat functionality

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd TaskFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the API key using the exact variable name expected by `server.js`.

```env
GEMINI_API_KEY=your_api_key_here
```

Keep your API key private. Never expose it in client-side JavaScript or commit the `.env` file.

### 4. Start the application

If `package.json` defines a start script:

```bash
npm start
```

Otherwise, if the server entry point is `server.js`:

```bash
node server.js
```

### 5. Open TaskFlow

Open the local URL printed in your terminal. Ensure the backend is running for AI chat functionality.

---

## 🧠 Design Philosophy

TaskFlow is built around three principles:

- **Clarity over clutter** — Keep tasks, goals, and progress easy to understand.
- **Focus over distraction** — Make it easier to start work and stay consistent.
- **Reflection over guesswork** — Use daily reviews and productivity summaries to understand progress.

---

## 🔭 What's Next?

Potential areas for future development include:

- Calendar-based task planning
- More detailed productivity analytics
- Cloud synchronization and user accounts
- Improved task organization and search
- Further accessibility and mobile UI improvements

*These are potential enhancements, not claims about currently implemented functionality.*

---

## 👩‍💻 Development

TaskFlow is an evolving project focused on frontend development, backend API integration, and practical AI application development.

Contributions, feedback, and suggestions are welcome. Please open an issue to discuss substantial changes before submitting a pull request.


**TaskFlow — Plan your day. Protect your focus. Make progress.**
