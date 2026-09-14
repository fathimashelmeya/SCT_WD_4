/* ==========================================
   TASKORA - TO-DO WEB APP
========================================== */

/* ==========================================
   ELEMENTS
========================================== */

const taskContainer = document.getElementById("taskContainer");

const emptyState = document.getElementById("emptyState");

const modalOverlay = document.getElementById("modalOverlay");

const taskForm = document.getElementById("taskForm");

const taskName = document.getElementById("taskName");

const taskDueDate = document.getElementById("taskDueDate");

const taskDueTime = document.getElementById("taskDueTime");

const taskCategory = document.getElementById("taskCategory");

const taskPriority = document.getElementById("taskPriority");

const taskDescription = document.getElementById("taskDescription");

const searchInput = document.getElementById("searchInput");

const sortSelect = document.getElementById("sortSelect");

/* ==========================================
   DATA
========================================== */

let tasks = JSON.parse(localStorage.getItem("taskoraTasks")) || [];

let currentView = "all";

let currentFilter = "all";

let editingTaskId = null;

/* ==========================================
   SAVE DATA
========================================== */

function saveTasks() {
  localStorage.setItem("taskoraTasks", JSON.stringify(tasks));
}

/* ==========================================
   DATE HELPERS
========================================== */

function getToday() {
  const date = new Date();

  return date.toISOString().split("T")[0];
}

function formatDate(date) {
  if (!date) {
    return "No due date";
  }

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ==========================================
   GREETING
========================================== */

function setGreeting() {
  const hour = new Date().getHours();

  let greeting;

  if (hour < 12) {
    greeting = "Good morning ☀️";
  } else if (hour < 18) {
    greeting = "Good afternoon 🌸";
  } else {
    greeting = "Good evening 🌙";
  }

  document.getElementById("greeting").textContent = greeting;
}

/* ==========================================
   OPEN MODAL
========================================== */

function openModal(task = null) {
  modalOverlay.classList.add("show");

  document.body.style.overflow = "hidden";

  if (task) {
    editingTaskId = task.id;

    document.getElementById("modalTitle").textContent = "Edit Task ✏️";

    taskName.value = task.title;

    taskDueDate.value = task.dueDate || "";

    taskDueTime.value = task.dueTime || "";

    taskCategory.value = task.category;

    taskPriority.value = task.priority;

    taskDescription.value = task.description || "";
  } else {
    editingTaskId = null;

    document.getElementById("modalTitle").textContent = "Create New Task ✨";

    taskForm.reset();
  }

  setTimeout(() => {
    taskName.focus();
  }, 200);
}

/* ==========================================
   CLOSE MODAL
========================================== */

function closeModal() {
  modalOverlay.classList.remove("show");

  document.body.style.overflow = "";

  editingTaskId = null;

  taskForm.reset();
}

/* ==========================================
   ADD / EDIT TASK
========================================== */

taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = taskName.value.trim();

  if (!title) {
    return;
  }

  /* EDIT */

  if (editingTaskId) {
    const task = tasks.find((task) => task.id === editingTaskId);

    if (task) {
      task.title = title;

      task.dueDate = taskDueDate.value;

      task.dueTime = taskDueTime.value;

      task.category = taskCategory.value;

      task.priority = taskPriority.value;

      task.description = taskDescription.value.trim();
    }

    showToast("Task updated successfully ✨");
  } else {

  /* ADD */
    const newTask = {
      id: Date.now(),

      title: title,

      dueDate: taskDueDate.value,

      dueTime: taskDueTime.value,

      category: taskCategory.value,

      priority: taskPriority.value,

      description: taskDescription.value.trim(),

      completed: false,

      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);

    showToast("New task created! ✨");
  }

  saveTasks();

  closeModal();

  renderTasks();
});

/* ==========================================
   COMPLETE TASK
========================================== */

function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (!task) {
    return;
  }

  task.completed = !task.completed;

  saveTasks();

  renderTasks();

  if (task.completed) {
    showToast("Task completed! 🎉 Great job!");
  }
}

/* ==========================================
   DELETE TASK
========================================== */

function deleteTask(id) {
  const shouldDelete = confirm("Are you sure you want to delete this task? 🗑️");

  if (!shouldDelete) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();

  renderTasks();

  showToast("Task deleted 🗑️");
}

/* ==========================================
   EDIT TASK
========================================== */

function editTask(id) {
  const task = tasks.find((task) => task.id === id);

  if (task) {
    openModal(task);
  }
}

/* ==========================================
   FILTER TASKS
========================================== */

function getFilteredTasks() {
  let result = [...tasks];

  /* View */

  if (currentView === "today") {
    result = result.filter((task) => task.dueDate === getToday());
  }

  if (currentView === "upcoming") {
    result = result.filter(
      (task) => task.dueDate && task.dueDate > getToday() && !task.completed,
    );
  }

  if (currentView === "completed") {
    result = result.filter((task) => task.completed);
  }

  /* Category */

  if (
    currentView !== "all" &&
    ["Work", "Study", "Personal", "Other"].includes(currentView)
  ) {
    result = result.filter((task) => task.category === currentView);
  }

  /* Toolbar filter */

  if (currentFilter === "pending") {
    result = result.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    result = result.filter((task) => task.completed);
  }

  /* Search */

  const search = searchInput.value.toLowerCase().trim();

  if (search) {
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search) ||
        task.category.toLowerCase().includes(search),
    );
  }

  /* Sorting */

  const sort = sortSelect.value;

  if (sort === "newest") {
    result.sort((a, b) => b.id - a.id);
  }

  if (sort === "oldest") {
    result.sort((a, b) => a.id - b.id);
  }

  if (sort === "priority") {
    const order = {
      High: 1,
      Medium: 2,
      Low: 3,
    };

    result.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  if (sort === "date") {
    result.sort((a, b) =>
      (a.dueDate || "9999").localeCompare(b.dueDate || "9999"),
    );
  }

  return result;
}

/* ==========================================
   RENDER TASKS
========================================== */

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  taskContainer.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  filteredTasks.forEach((task) => {
    const card = document.createElement("div");

    card.className = `task-card ${task.completed ? "completed" : ""}`;

    card.innerHTML = `

            <div
                class="task-check"
                onclick="toggleTask(${task.id})"
            >
                ${task.completed ? "✓" : ""}
            </div>


            <div class="task-info">

                <div class="task-title">

                    ${escapeHTML(task.title)}

                </div>


                ${
                  task.description
                    ? `
                    <div class="task-description">
                        ${escapeHTML(task.description)}
                    </div>
                    `
                    : ""
                }


                <div class="task-meta">

                    <span
                        class="badge ${task.category}"
                    >
                        ${getCategoryEmoji(task.category)}
                        ${task.category}
                    </span>


                    <span
                        class="priority ${task.priority}"
                    >

                        <i class="priority-dot"></i>

                        ${task.priority}
                        Priority

                    </span>


                    ${
                      task.dueDate
                        ? `
                        <span>
                            📅
                            ${formatDate(task.dueDate)}
                        </span>
                        `
                        : ""
                    }


                    ${
                      task.dueTime
                        ? `
                        <span>
                            ⏰
                            ${task.dueTime}
                        </span>
                        `
                        : ""
                    }

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="task-action"
                    onclick="editTask(${task.id})"
                    title="Edit"
                >
                    ✏️
                </button>


                <button
                    class="task-action"
                    onclick="deleteTask(${task.id})"
                    title="Delete"
                >
                    🗑️
                </button>

            </div>

        `;

    taskContainer.appendChild(card);
  });

  updateStats();
}

/* ==========================================
   CATEGORY EMOJI
========================================== */

function getCategoryEmoji(category) {
  const emojis = {
    Work: "💼",

    Study: "📚",

    Personal: "💗",

    Other: "🌱",
  };

  return emojis[category] || "📌";
}

/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStats() {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.completed).length;

  const pending = total - completed;

  const high = tasks.filter(
    (task) => task.priority === "High" && !task.completed,
  ).length;

  const today = tasks.filter((task) => task.dueDate === getToday()).length;

  const upcoming = tasks.filter(
    (task) => task.dueDate && task.dueDate > getToday() && !task.completed,
  ).length;

  document.getElementById("totalStat").textContent = total;

  document.getElementById("highStat").textContent = high;

  document.getElementById("doneStat").textContent = completed;

  document.getElementById("pendingStat").textContent = pending;

  document.getElementById("allCount").textContent = total;

  document.getElementById("todayCount").textContent = today;

  document.getElementById("upcomingCount").textContent = upcoming;

  document.getElementById("completedCount").textContent = completed;

  /* Progress */

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("progressPercent").textContent = `${percentage}%`;

  document.getElementById("progressFill").style.width = `${percentage}%`;

  document.getElementById("progressText").textContent =
    `${completed} of ${total} tasks completed`;
}

/* ==========================================
   VIEW NAVIGATION
========================================== */

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-item")
      .forEach((btn) => btn.classList.remove("active"));

    this.classList.add("active");

    currentView = this.dataset.view;

    updatePageText();

    renderTasks();
  });
});

/* ==========================================
   CATEGORY NAVIGATION
========================================== */

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".nav-item")
      .forEach((btn) => btn.classList.remove("active"));

    currentView = this.dataset.category;

    updatePageText();

    renderTasks();
  });
});

/* ==========================================
   PAGE TITLES
========================================== */

function updatePageText() {
  const titles = {
    all: "My Tasks",

    today: "Today's Tasks",

    upcoming: "Upcoming Tasks",

    completed: "Completed Tasks",

    Work: "Work Tasks",

    Study: "Study Tasks",

    Personal: "Personal Tasks",

    Other: "Other Tasks",
  };

  const subtitles = {
    all: "Manage everything in one place",

    today: "Focus on what needs to be done today",

    upcoming: "Plan ahead and stay prepared",

    completed: "Look at everything you've achieved",

    Work: "Keep your work organized",

    Study: "Stay on top of your learning",

    Personal: "Manage your personal goals",

    Other: "Everything else on your list",
  };

  const title = titles[currentView] || "My Tasks";

  document.getElementById("pageTitle").textContent = title;

  document.getElementById("taskHeading").textContent = title;

  document.getElementById("taskSubheading").textContent =
    subtitles[currentView] || subtitles.all;
}

/* ==========================================
   FILTER BUTTONS
========================================== */

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".filter")
      .forEach((btn) => btn.classList.remove("active"));

    this.classList.add("active");

    currentFilter = this.dataset.filter;

    renderTasks();
  });
});

/* ==========================================
   SEARCH
========================================== */

searchInput.addEventListener("input", renderTasks);

/* ==========================================
   SORT
========================================== */

sortSelect.addEventListener("change", renderTasks);

/* ==========================================
   MODAL BUTTONS
========================================== */

document
  .getElementById("openModal")
  .addEventListener("click", () => openModal());

document
  .getElementById("emptyAdd")
  .addEventListener("click", () => openModal());

document.getElementById("closeModal").addEventListener("click", closeModal);

document.getElementById("cancelModal").addEventListener("click", closeModal);

modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

/* ==========================================
   DARK MODE
========================================== */

document.getElementById("themeBtn").addEventListener("click", function () {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  this.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";

  localStorage.setItem("taskoraTheme", dark ? "dark" : "light");
});

/* Load saved theme */

if (localStorage.getItem("taskoraTheme") === "dark") {
  document.body.classList.add("dark");

  document.getElementById("themeBtn").textContent = "☀️ Light Mode";
}

/* ==========================================
   TOAST
========================================== */

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.querySelector("p").textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ==========================================
   KEYBOARD SHORTCUT
========================================== */

document.addEventListener("keydown", function (event) {
  /* Escape closes modal */

  if (event.key === "Escape") {
    closeModal();
  }

  /* Ctrl + K focuses search */

  if (event.ctrlKey && event.key.toLowerCase() === "k") {
    event.preventDefault();

    searchInput.focus();
  }
});

/* ==========================================
   START APPLICATION
========================================== */

setGreeting();

renderTasks();
