
const $ = id => document.getElementById(id);

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let filter = "all";
let seconds = 1500;
let timer = null;
let running = false;

function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateStats() {
  const completed = tasks.filter(task => task.done).length;

  $("completedCount").textContent = completed;
  $("taskCount").textContent = tasks.length;
  $("goalProgressNote").textContent =
    `${completed} of ${tasks.length} tasks completed`;

  const goal = Number($("dailyGoalHours").value) || 3;
  const focused = Number(localStorage.getItem("focusedMinutes") || 0);
  const progress = Math.min((focused / (goal * 60)) * 100, 100);

  $("focusedToday").textContent = `${Math.floor(focused / 60)}h ${focused % 60}m`;
  $("goalProgress").textContent = `${Math.round(progress)}%`;
  $("goalProgressBar").style.width = `${progress}%`;
}

function renderTasks() {
  const list = $("taskList");
  list.replaceChildren();

  const shown = tasks.filter(task =>
    filter === "all" ||
    (filter === "completed" ? task.done : !task.done)
  );

  $("emptyTasks").hidden = shown.length > 0;

  shown.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item" + (task.done ? " is-complete" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "task-check";
    check.checked = task.done;

    check.onchange = () => {
      task.done = check.checked;
      save();
      renderTasks();
    };

    const body = document.createElement("div");
    body.className = "task-body";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent =
      task.priority + (task.due ? " · " + task.due : "");

    body.append(title, meta);

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete task");

    del.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      save();
      renderTasks();
    };

    item.append(check, body, del);
    list.append(item);
  });

  updateStats();
}

$("taskForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("taskTitle").value.trim();
  if (!title) return;

  tasks.push({
    id: Date.now(),
    title,
    priority: $("taskPriority").value,
    due: $("taskDueDate").value,
    done: false
  });

  save();
  renderTasks();
  $("taskForm").reset();
});

document.querySelectorAll(".filter-btn").forEach(button => {
  button.onclick = () => {
    filter = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    renderTasks();
  };
});

function showTime() {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  $("timerDisplay").textContent =
    `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
  running = false;
}

document.querySelectorAll(".timer-mode").forEach(button => {
  button.onclick = () => {
    stopTimer();
    seconds = Number(button.dataset.minutes) * 60;

    document.querySelectorAll(".timer-mode").forEach(btn => {
      btn.classList.toggle("active", btn === button);
    });

    $("startTimerBtn").textContent = "Start focus";
    showTime();
  };
});

$("startTimerBtn").onclick = () => {
  if (running) {
    stopTimer();
    $("startTimerBtn").textContent = "Resume";
    return;
  }

  running = true;
  $("startTimerBtn").textContent = "Pause";

  timer = setInterval(() => {
    seconds--;
    showTime();

    if (seconds <= 0) {
      stopTimer();

      const minutes = Number(
        document.querySelector(".timer-mode.active")?.dataset.minutes || 25
      );

      const total = Number(localStorage.getItem("focusedMinutes") || 0);
      localStorage.setItem("focusedMinutes", total + minutes);

      $("startTimerBtn").textContent = "Start again";
      $("timerMessage").textContent =
        "Session complete! Take a short break.";

      updateStats();
    }
  }, 1000);
};

$("resetTimerBtn").onclick = () => {
  stopTimer();

  seconds = Number(
    document.querySelector(".timer-mode.active")?.dataset.minutes || 25
  ) * 60;

  $("startTimerBtn").textContent = "Start focus";
  showTime();
};

function updateDate() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  $("selectedDate").value = date;
}

$("generateBriefingBtn").onclick = () => {
  const remaining = tasks
    .filter(task => !task.done)
    .sort((a, b) =>
      ["high", "medium", "low"].indexOf(a.priority) -
      ["high", "medium", "low"].indexOf(b.priority)
    )
    .slice(0, 3);

  $("briefingTitle").textContent = remaining.length
    ? "Let's focus on what matters."
    : "Your day is yours to plan.";

  $("briefingText").textContent = remaining.length
    ? "Start with: " + remaining.map(task => task.title).join(", ")
    : "Add a task to create your plan.";
};

$("saveGoalBtn").onclick = () => {
  const goal = Number($("dailyGoalHours").value) || 3;

  localStorage.setItem("dailyGoal", goal);
  $("dailyGoalHours").value = goal;
  $("goalDetail").textContent = `Your daily focus goal is ${goal} hours.`;

  updateStats();
};

$("saveReflectionBtn").onclick = () => {
  const text = $("reflectionText").value.trim();

  if (!text) {
    $("reflectionMessage").textContent =
      "Write a short reflection first.";
    return;
  }

  const reviews = JSON.parse(localStorage.getItem("reviews") || "[]");

  reviews.push({
    date: $("selectedDate").value,
    text,
    category: $("reflectionCategory").value,
    planned: $("plannedHours").value,
    actual: $("actualHours").value
  });

  localStorage.setItem("reviews", JSON.stringify(reviews.slice(-30)));
  $("reflectionMessage").textContent = "Reflection saved!";
};

$("saveWinBtn").onclick = () => {
  const win = $("unplannedWin").value.trim();
  if (!win) return;

  const wins = JSON.parse(localStorage.getItem("wins") || "[]");
  wins.push({ date: $("selectedDate").value, text: win });

  localStorage.setItem("wins", JSON.stringify(wins.slice(-30)));
  $("unplannedWin").value = "";
  $("reflectionMessage").textContent = "Your win has been saved!";
};

function addMessage(text, className) {
  const message = document.createElement("div");
  message.className = "chat-bubble " + className;
  message.textContent = text;

  $("chatMessages").append(message);
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

// Real AI chatbot: sends the message to your server.
$("chatForm").onsubmit = async event => {
  event.preventDefault();

  const input = $("chatInput");
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user-bubble");
  input.value = "";

  const loading = document.createElement("div");
  loading.className = "chat-bubble assistant-bubble";
  loading.textContent = "Thinking...";
  $("chatMessages").append(loading);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, tasks })
    });

    const data = await response.json();
    loading.remove();

    addMessage(
      response.ok
        ? data.reply || "I couldn't generate a reply."
        : data.error || "The AI request failed.",
      "assistant-bubble"
    );
  } catch {
    loading.remove();

    addMessage(
      "Couldn't connect to TaskFlow. Make sure your server is running.",
      "assistant-bubble"
    );
  }
};

$("voiceBtn").onclick = () => {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Speech) {
    $("reflectionMessage").textContent =
      "Voice input isn't supported in this browser.";
    return;
  }

  const recognition = new Speech();
  recognition.lang = "en-IN";

  recognition.onresult = event => {
    $("reflectionText").value +=
      " " + event.results[0][0].transcript;
  };

  recognition.start();
};

$("reflectionText").addEventListener("input", () => {
  $("reviewSummary").textContent =
    "Take a moment to reflect without judging yourself.";
});

const dialog = $("calmDialog");

dialog.querySelector(".dialog-content").addEventListener("click", event => {
  if (event.target.id === "startBreathingBtn") {
    $("breathingText").textContent =
      "Breathe in slowly, then breathe out.";

    $("breathingCircle").classList.toggle("inhale");
    $("breathingCircle").classList.toggle("exhale");
  }

  if (event.target.id === "reflectAfterCalmBtn") {
    dialog.close();
    $("reflectionText").focus();
  }
});

$("closeCalmBtn").onclick = () => dialog.close();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.onclick = () => {
    document.querySelectorAll(".nav-link").forEach(nav => {
      nav.classList.toggle("active", nav === link);
    });
  };
});

updateDate();
$("dailyGoalHours").value = localStorage.getItem("dailyGoal") || 3;
$("goalDetail").textContent =
  `Your daily focus goal is ${$("dailyGoalHours").value} hours.`;

showTime();
renderTasks();
