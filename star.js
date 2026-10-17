
const initialTasks = [
  { id: 1, title: "Finish project documentation", description: "Review the requirements and complete the project notes.", priority: "high", completed: false, createdAt: Date.now() - 4000 },
  { id: 2, title: "Review Java programming notes", description: "Revise the important concepts before the next study session.", priority: "medium", completed: false, createdAt: Date.now() - 3000 },
  { id: 3, title: "Organize this week's goals", description: "Set clear priorities and break down larger tasks.", priority: "low", completed: true, createdAt: Date.now() - 2000 }
];

let tasks = initialTasks.map(task => ({ ...task }));
let currentFilter = "all";
let toastTimer;

const $ = id => document.getElementById(id);
const taskList = $("taskList");
const modalBackdrop = $("modalBackdrop");
const taskForm = $("taskForm");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = total - completed;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  $("totalCount").textContent = total;
  $("activeCount").textContent = active;
  $("completedCount").textContent = completed;
  $("progressPercent").textContent = `${progress}%`;
  $("progressFill").style.width = `${progress}%`;
  $("progressText").textContent = total
    ? `${completed} of ${total} tasks completed`
    : "Every task starts with one step.";

  $("allNavCount").textContent = total;
  $("allTabCount").textContent = total;
  $("activeTabCount").textContent = active;
  $("completedTabCount").textContent = completed;
  $("taskTotal").textContent = `${total} ${total === 1 ? "task" : "tasks"}`;
}

function getVisibleTasks() {
  const query = $("searchInput").value.trim().toLowerCase();
  const sort = $("sortSelect").value;

  let visible = tasks.filter(task => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (sort === "newest") visible.sort((a, b) => b.createdAt - a.createdAt);
  if (sort === "oldest") visible.sort((a, b) => a.createdAt - b.createdAt);
  if (sort === "az") visible.sort((a, b) => a.title.localeCompare(b.title));

  return visible;
}

function renderTasks() {
  updateStats();

  document.querySelectorAll("[data-filter]").forEach(button => {
    button.classList.toggle("selected", button.classList.contains("filter-tab") && button.dataset.filter === currentFilter);
    button.classList.toggle("active", button.classList.contains("nav-item") && button.dataset.filter === currentFilter);
  });

  const visible = getVisibleTasks();
  taskList.innerHTML = "";

  $("emptyState").classList.toggle("hidden", visible.length > 0);
  taskList.classList.toggle("hidden", visible.length === 0);

  if (visible.length === 0) {
    const hasTasks = tasks.length > 0;
    $("emptyTitle").textContent = hasTasks ? "No matching tasks" : "Your next win starts here";
    $("emptyMessage").textContent = hasTasks
      ? "Try a different search or filter."
      : "Add your first task and start making progress.";
    $("emptyAddButton").classList.toggle("hidden", hasTasks);
  }

  visible.forEach(task => {
    const row = document.createElement("article");
    row.className = `task-row${task.completed ? " is-completed" : ""}`;
    row.innerHTML = `
      <button class="task-check${task.completed ? " checked" : ""}" data-action="toggle" data-id="${task.id}" aria-label="${task.completed ? "Mark incomplete" : "Mark complete"}">${task.completed ? "✓" : ""}</button>
      <div class="task-main">
        <div class="task-title">${escapeHTML(task.title)}</div>
        ${task.description ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ""}
        <div class="task-meta">
          <span class="priority ${task.priority}">${task.priority[0].toUpperCase() + task.priority.slice(1)} priority</span>
          <span class="task-date">${task.completed ? "Completed" : "Added recently"}</span>
        </div>
      </div>
      <button class="delete-button" data-action="delete" data-id="${task.id}" aria-label="Delete ${escapeHTML(task.title)}">Delete</button>
    `;
    taskList.appendChild(row);
  });
}

function openModal() {
  modalBackdrop.classList.remove("hidden");
  $("taskTitle").focus();
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  taskForm.reset();
}

function createTask(event) {
  event.preventDefault();

  const title = $("taskTitle").value.trim();
  const description = $("taskDescription").value.trim();
  const priority = $("taskPriority").value;

  if (!title) {
    $("taskTitle").focus();
    return;
  }

  tasks.unshift({
    id: Date.now(),
    title,
    description,
    priority,
    completed: false,
    createdAt: Date.now()
  });

  currentFilter = "all";
  $("searchInput").value = "";
  $("sortSelect").value = "newest";
  closeModal();
  renderTasks();
  showToast("Task created successfully");
}

$("openModal").addEventListener("click", openModal);
$("emptyAddButton").addEventListener("click", openModal);
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);
taskForm.addEventListener("submit", createTask);

modalBackdrop.addEventListener("click", event => {
  if (event.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
    closeModal();
  }
});

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

$("searchInput").addEventListener("input", renderTasks);
$("sortSelect").addEventListener("change", renderTasks);

taskList.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle") {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    task.completed = !task.completed;
    renderTasks();
    showToast(task.completed ? "Nice work — task completed!" : "Task moved back to in progress");
  }

  if (action === "delete") {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
    showToast("Task deleted");
  }
});

const dateLabel = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric"
});
$("currentDate").textContent = dateLabel.format(new Date()).toUpperCase();

renderTasks();
