# TaskFlow — Personal Productivity Dashboard

**Plan your day. Protect your focus. See your progress.**

TaskFlow is a personal productivity web app that brings task management, calendar planning, focus tracking, habits, and daily reflection into one workspace. It combines a Kanban workflow with productivity insights to help users plan their work, stay focused, and understand how they spend their time.

**[Live Demo](https://task-flow-gold-psi.vercel.app/)**

![HTML5](https://img.shields.io/badge/HTML5-0e1330?style=flat&logo=html5&logoColor=ff4d7e)
![CSS3](https://img.shields.io/badge/CSS3-0e1330?style=flat&logo=css3&logoColor=ff4d7e)
![JavaScript](https://img.shields.io/badge/JavaScript-0e1330?style=flat&logo=javascript&logoColor=ff4d7e)
![Node.js](https://img.shields.io/badge/Node.js-0e1330?style=flat&logo=nodedotjs&logoColor=ff4d7e)
![Gemini API](https://img.shields.io/badge/Gemini_API-0e1330?style=flat&logo=googlegemini&logoColor=ff4d7e)
![Vercel](https://img.shields.io/badge/Vercel-0e1330?style=flat&logo=vercel&logoColor=ff4d7e)

## Overview

TaskFlow goes beyond a traditional to-do list by connecting task management with focus sessions and progress tracking. Tasks, estimated effort, and focus time work together to provide a clearer picture of daily productivity.

The application is designed for people who want a structured workflow without the overhead of a complex project management tool.

## Features

### Task management
- **Kanban board:** Organize tasks into To do, In progress, and Done columns with drag-and-drop support.
- **Natural-language quick add:** Create tasks with due dates, time estimates, priorities, and tags from a single line.
- **Task editing:** Manage notes, subtasks, due dates, estimated time, priorities, tags, and recurring schedules.
- **Recurring tasks:** Generate the next task when a daily or weekly task is completed.
- **Search and undo:** Find tasks quickly and recover recently deleted tasks.
- **Focus mode:** Reduce distractions by concentrating on your top task.

### Planning and prioritization
- **Calendar:** View tasks by due date and create tasks directly from a selected day.
- **Eisenhower matrix:** Prioritize work using four categories: Do now, Plan it, Squeeze in, and Maybe later.
- **Capacity awareness:** See when the estimated time for open tasks exceeds your daily focus goal.

### Focus and productivity
- **Focus timer:** Choose 25-minute or 50-minute focus sessions, or take a 5-minute break.
- **Task-linked focus tracking:** Start a focus session from a task and log the time spent working on it.
- **Daily focus goal:** Track your progress toward a daily target.

### Progress and reflection
- **Productivity charts:** Review focus time and completed tasks over the previous 14 days.
- **Streak tracking:** Monitor consistency and view a 12-week activity grid.
- **Daily review:** Reflect on planned versus completed hours, obstacles, and notes.
- **Shutdown ritual:** Close the day with three guided reflection questions.
- **Habit tracker:** Track habits through a seven-day view and streaks.

### Additional features
- **AI productivity assistant:** Get task-aware suggestions using the Google Gemini API.
- **Guided breathing break:** Take a short break between work sessions.
- **Dark mode:** Switch between light and dark themes.
- **Keyboard shortcuts:** Add tasks and access search without relying entirely on the mouse.

## Natural-language quick add

Create tasks without filling out every field manually.

```text
Study DSA tomorrow 2h !high #study
```

TaskFlow interprets supported keywords to populate task details.

| Input | Purpose |
| --- | --- |
| `today`, `tomorrow`, `friday`, `in 3 days` | Due date |
| `30m`, `2h` | Estimated duration |
| `!high`, `!medium`, `!low` | Priority |
| `#study` | Tag |

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `N` | Add a task |
| `/` | Search tasks |

## Tech stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Application structure |
| CSS3 | Layout, styling, and responsive interface |
| JavaScript | Task management, timers, calendar, charts, and interactions |
| Node.js | Local development and server-side runtime |
| Google Gemini API | AI-powered productivity assistance |
| Vercel | Deployment and serverless API hosting |

## Architecture

TaskFlow uses a browser-based frontend with a serverless API for AI requests.

```text
User
  |
  v
Browser application
  |
  +-- index.html
  +-- style.css
  +-- star.js
  |
  +-- localStorage
  |     Tasks, habits, reviews, and preferences
  |
  v
/api/chat
  |
  v
Vercel serverless function
  |
  v
Google Gemini API
```

- **Client-side storage:** Application data is saved in the user's browser using `localStorage`.
- **Server-side AI requests:** The assistant endpoint calls Gemini without exposing the API key directly to frontend JavaScript.
- **Request limit:** The AI assistant is limited to 20 messages per visitor per hour, according to the configured application behavior.

### Data and privacy

TaskFlow does not require an account. Tasks, habits, and daily reviews are stored locally in the browser rather than synchronized through a TaskFlow user database.

This means data does not automatically sync across devices, and clearing the browser's stored site data can remove saved information.

The AI assistant sends a request to the serverless endpoint to obtain a response. Avoid including sensitive personal information in AI prompts.

## Project structure

```text
TaskFlow/
├── api/
│   └── chat.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── star.js
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

- `api/chat.js` — Serverless endpoint for the AI assistant.
- `public/index.html` — Application markup and interface structure.
- `public/style.css` — Design system, styling, and layout.
- `public/star.js` — Client-side application logic and interactions.
- `vercel.json` — Vercel deployment configuration.
- `package.json` — Project metadata and dependencies.

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- A Google Gemini API key for the AI assistant
- Vercel CLI for local development with Vercel functions

### 1. Clone the repository

```bash
git clone https://github.com/ShreyaSankpal/TaskFlow.git
cd TaskFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the environment

Install the Vercel CLI if it is not already installed:

```bash
npm install -g vercel
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

Keep the API key private. Never place it in frontend JavaScript or commit it to GitHub. Ensure `.env` is included in `.gitignore`.

### 4. Run locally

```bash
vercel dev
```

Open the local URL displayed in the terminal.

The application interface and AI assistant depend on the project's Vercel routing and environment configuration.

## Deployment

TaskFlow is deployed on Vercel.

To deploy your own instance:

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Add `GEMINI_API_KEY` under **Project Settings → Environment Variables**.
4. Deploy the application.
5. Test the task workflows and AI assistant on the deployed URL.

If you change an environment variable, redeploy the application for the change to take effect.

## Future improvements

- Browser notifications for upcoming due dates.
- Drag-and-drop rescheduling directly on the calendar.
- Optional accounts and cloud synchronization.
- Week-over-week productivity comparisons.
- AI-assisted task creation and subtask generation.

## What this project demonstrates

TaskFlow is a hands-on project exploring:

- Building an interactive web application with HTML, CSS, and JavaScript.
- Managing application state and browser-based persistence.
- Designing productivity workflows and reusable UI components.
- Integrating a third-party AI API through a serverless backend.
- Managing environment variables and deploying with Vercel.

## Author

**Shreya Sankpal**
