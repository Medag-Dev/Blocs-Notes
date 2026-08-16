/* =========================================================
   NOTES APP — REMASTER
========================================================= */

/* =========================================================
   QUILL
========================================================= */

const quill = new Quill("#editor", {
  theme: "snow",

  placeholder: "Commencez à écrire votre note...",

  modules: {
    syntax: true,

    toolbar: "#toolbar-container",
  },
});

/* =========================================================
   DOM
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);

/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {
  notes: "notes_remaster",

  tasks: "tasks_remaster",

  trash: "trash_remaster",

  profile: "profile_remaster",

  theme: "theme_remaster",
};

/* =========================================================
   STATE
========================================================= */

const state = {
  notes: load(STORAGE.notes, []),

  tasks: load(STORAGE.tasks, []),

  trash: load(STORAGE.trash, []),

  profile: load(STORAGE.profile, {
    name: "",

    email: "",

    gender: "Homme",
  }),

  theme: localStorage.getItem(STORAGE.theme) || "system",

  currentView: "notes",

  currentCategory: null,

  taskFilter: "all",

  editingNoteId: null,

  noteFavorite: false,

  pendingConfirm: null,
};

/* =========================================================
   HELPERS
========================================================= */

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));

  setSaved();
}

function generateId(prefix = "id") {
  return (
    prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8)
  );
}

function escapeHTML(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatShortDate(date) {
  if (!date) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function toast(text, type = "normal") {
  let background = "linear-gradient(135deg,#007aff,#5ac8fa)";

  if (type === "success") {
    background = "linear-gradient(135deg,#34c759,#30d158)";
  }

  if (type === "error") {
    background = "linear-gradient(135deg,#ff3b30,#ff6961)";
  }

  Toastify({
    text,

    duration: 2200,

    close: true,

    gravity: "bottom",

    position: "right",

    style: {
      background,
    },
  }).showToast();
}

/* =========================================================
   SAVE STATUS
========================================================= */

function setSaved() {
  const status = $("#saveStatus");

  const dot = $("#statusDot");

  if (!status) return;

  status.textContent = "Enregistré";

  dot.style.background = "var(--green)";
}

/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {
  state.theme = theme;

  localStorage.setItem(STORAGE.theme, theme);

  let dark = false;

  if (theme === "dark") {
    dark = true;
  } else if (theme === "system") {
    dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.body.classList.toggle("dark", dark);

  updateThemeUI();
}

function updateThemeUI() {
  const label = $("#themeLabel");

  if (!label) return;

  if (state.theme === "dark") {
    label.textContent = "Sombre";
  } else if (state.theme === "light") {
    label.textContent = "Clair";
  } else {
    label.textContent = "Système";
  }

  $$(".theme-option").forEach((option) => {
    option.classList.toggle("active", option.dataset.theme === state.theme);
  });
}

applyTheme(state.theme);

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (state.theme === "system") {
      applyTheme("system");
    }
  });

/* =========================================================
   THEME BUTTONS
========================================================= */

$("#themeButton").addEventListener("click", () => {
  openModal("themeModal");
});

$("#quickTheme").addEventListener("click", () => {
  const next = state.theme === "dark" ? "light" : "dark";

  applyTheme(next);
});

$$(".theme-option").forEach((option) => {
  option.addEventListener("click", () => {
    applyTheme(option.dataset.theme);

    closeModal("themeModal");
  });
});

/* =========================================================
   SIDEBAR
========================================================= */

const sidebar = $("#sidebar");
const overlay = $("#sidebarOverlay");

function openSidebar() {
  sidebar.classList.add("open");

  overlay.classList.add("open");
}

function closeSidebar() {
  sidebar.classList.remove("open");

  overlay.classList.remove("open");
}

$("#mobileMenu").addEventListener("click", openSidebar);

$("#sidebarClose").addEventListener("click", closeSidebar);

overlay.addEventListener("click", closeSidebar);

/* =========================================================
   NAVIGATION
========================================================= */

function showView(view) {
  state.currentView = view;

  state.currentCategory = null;

  $$(".view").forEach((section) => {
    section.classList.add("hidden");
  });

  const target =
    view === "notes"
      ? $("#notesView")
      : view === "tasks"
        ? $("#tasksView")
        : view === "favorites"
          ? $("#favoritesView")
          : view === "trash"
            ? $("#trashView")
            : $("#notesView");

  target.classList.remove("hidden");

  $$(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  $$(".bottom-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  if (view === "notes") {
    $("#pageTitle").textContent = getGreeting();

    $("#pageSubtitle").textContent =
      "Organisez vos idées, vos notes et vos tâches.";
  }

  if (view === "tasks") {
    $("#pageTitle").textContent = "Mes tâches";

    $("#pageSubtitle").textContent =
      "Une chose à la fois. Vous allez y arriver.";
  }

  if (view === "favorites") {
    $("#pageTitle").textContent = "Vos favoris ⭐";

    $("#pageSubtitle").textContent =
      "Les notes importantes, toujours à portée de main.";
  }

  if (view === "trash") {
    $("#pageTitle").textContent = "Corbeille";

    $("#pageSubtitle").textContent = "Gérez les éléments supprimés.";
  }

  closeSidebar();

  render();
}

$$("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

$$(".category-item").forEach((button) => {
  button.addEventListener("click", () => {
    state.currentCategory = button.dataset.category;

    $$(".view").forEach((view) => view.classList.add("hidden"));

    $("#categoryView").classList.remove("hidden");

    $("#categoryTitle").textContent = state.currentCategory;

    $("#categoryBadge").textContent = state.currentCategory;

    renderCategory();

    closeSidebar();
  });
});

/* =========================================================
   GREETING
========================================================= */

function getGreeting() {
  const hour = new Date().getHours();

  let greeting = "Bonjour";

  if (hour >= 18) {
    greeting = "Bonsoir";
  } else if (hour >= 12) {
    greeting = "Bon après-midi";
  }

  const name = state.profile.name ? `, ${escapeHTML(state.profile.name)}` : "";

  return `${greeting}${name} 👋`;
}

$("#pageTitle").textContent = getGreeting();

/* =========================================================
   NOTES
========================================================= */

function openNoteEditor(note = null) {
  state.editingNoteId = note ? note.id : null;

  state.noteFavorite = note ? !!note.favorite : false;

  $("#editorMode").textContent = note ? "Modifier la note" : "Nouvelle note";

  $("#editorSaveState").textContent = note
    ? `Modifiée ${formatShortDate(note.updatedAt)}`
    : "Non enregistrée";

  $("#noteTitle").value = note?.title || "";

  $("#noteCategory").value = note?.category || "Cours";

  updateFavoriteEditor();

  if (note) {
    quill.root.innerHTML = note.content || "";
  } else {
    quill.setText("");
  }

  openModal("noteModal");

  setTimeout(() => {
    $("#noteTitle").focus();
  }, 100);
}

function closeNoteEditor() {
  closeModal("noteModal");

  state.editingNoteId = null;

  state.noteFavorite = false;
}

function updateFavoriteEditor() {
  const button = $("#noteFavorite");

  button.classList.toggle("active", state.noteFavorite);

  button.innerHTML = state.noteFavorite
    ? '<i class="fa-solid fa-star"></i>'
    : '<i class="fa-regular fa-star"></i>';
}

$("#newNoteButton").addEventListener("click", () => openNoteEditor());

$("#desktopNewNote").addEventListener("click", () => openNoteEditor());

$("#emptyNewNote").addEventListener("click", () => openNoteEditor());

$("#mobileNewNote").addEventListener("click", () => openNoteEditor());

$("#closeNote").addEventListener("click", closeNoteEditor);

$("#noteFavorite").addEventListener("click", () => {
  state.noteFavorite = !state.noteFavorite;

  updateFavoriteEditor();
});

/* =========================================================
   SAVE NOTE
========================================================= */

$("#saveNote").addEventListener("click", saveCurrentNote);

function saveCurrentNote() {
  const title = $("#noteTitle").value.trim();

  const content = quill.root.innerHTML;

  const text = quill.getText().trim();

  if (!title) {
    toast("Donnez un titre à votre note.", "error");

    $("#noteTitle").focus();

    return;
  }

  if (!text) {
    toast("Votre note ne peut pas être vide.", "error");

    quill.focus();

    return;
  }

  const now = new Date().toISOString();

  if (state.editingNoteId) {
    const note = state.notes.find((n) => n.id === state.editingNoteId);

    if (note) {
      note.title = title;

      note.content = content;

      note.category = $("#noteCategory").value;

      note.favorite = state.noteFavorite;

      note.updatedAt = now;
    }

    toast("Note modifiée ✓", "success");
  } else {
    const note = {
      id: generateId("note"),

      title,

      content,

      category: $("#noteCategory").value,

      favorite: state.noteFavorite,

      createdAt: now,

      updatedAt: now,
    };

    state.notes.unshift(note);

    toast("Note enregistrée ✓", "success");
  }

  save(STORAGE.notes, state.notes);

  closeNoteEditor();

  render();
}

/* =========================================================
   NOTE CARD
========================================================= */

function createNoteCard(note) {
  const article = document.createElement("article");

  article.className = "note-card";

  article.style.setProperty("--note-color", getCategoryColor(note.category));

  const temp = document.createElement("div");

  temp.innerHTML = note.content || "";

  const preview = temp.textContent.replace(/\s+/g, " ").trim();

  article.innerHTML = `

    <div class="note-card-top">

      <span class="note-category">
        ${getCategoryEmoji(note.category)}
        ${escapeHTML(note.category)}
      </span>

      <button
        class="favorite-button
        ${note.favorite ? "active" : ""}"
        aria-label="Favori"
      >
        ${
          note.favorite
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>'
        }
      </button>

    </div>


    <h3>
      ${escapeHTML(note.title)}
    </h3>


    <p class="note-preview">
      ${escapeHTML(preview || "Cette note ne contient pas de texte.")}
    </p>


    <div class="note-card-footer">

      <span>
        Modifiée
        ${formatShortDate(note.updatedAt)}
      </span>


      <div class="note-actions">

        <button
          class="edit"
          aria-label="Modifier"
        >
          <i class="fa-solid fa-pen"></i>
        </button>

        <button
          class="delete"
          aria-label="Supprimer"
        >
          <i class="fa-regular fa-trash-can"></i>
        </button>

      </div>

    </div>

  `;

  const favorite = article.querySelector(".favorite-button");

  favorite.addEventListener("click", (event) => {
    event.stopPropagation();

    note.favorite = !note.favorite;

    save(STORAGE.notes, state.notes);

    render();
  });

  article.querySelector(".edit").addEventListener("click", (event) => {
    event.stopPropagation();

    openNoteEditor(note);
  });

  article.querySelector(".delete").addEventListener("click", (event) => {
    event.stopPropagation();

    moveToTrash(note, "note");
  });

  article.addEventListener("click", () => {
    openNoteEditor(note);
  });

  return article;
}

/* =========================================================
   CATEGORY HELPERS
========================================================= */

function getCategoryColor(category) {
  const colors = {
    Cours: "#007aff",

    Idées: "#af52de",

    Personnel: "#34c759",

    Travail: "#ff9500",
  };

  return colors[category] || "#007aff";
}

function getCategoryEmoji(category) {
  const emojis = {
    Cours: "📚",

    Idées: "💡",

    Personnel: "🌱",

    Travail: "💼",
  };

  return emojis[category] || "📁";
}

/* =========================================================
   SORT NOTES
========================================================= */

function sortNotes(notes) {
  const mode = $("#sortNotes").value;

  return [...notes].sort((a, b) => {
    if (mode === "az") {
      return a.title.localeCompare(b.title, "fr");
    }

    if (mode === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (mode === "created") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

$("#sortNotes").addEventListener("change", render);

/* =========================================================
   SEARCH
========================================================= */

$("#searchInput").addEventListener("input", render);

function getSearchResults(notes) {
  const search = $("#searchInput").value.trim().toLowerCase();

  if (!search) {
    return notes;
  }

  return notes.filter((note) => {
    const temp = document.createElement("div");

    temp.innerHTML = note.content || "";

    const content = temp.textContent || "";

    return (
      note.title.toLowerCase().includes(search) ||
      content.toLowerCase().includes(search) ||
      note.category.toLowerCase().includes(search)
    );
  });
}

/* =========================================================
   RENDER NOTES
========================================================= */

function renderNotes() {
  const grid = $("#notesGrid");

  const empty = $("#notesEmpty");

  let notes = getSearchResults(state.notes);

  notes = sortNotes(notes);

  grid.innerHTML = "";

  if (!notes.length) {
    empty.style.display = "block";

    return;
  }

  empty.style.display = "none";

  notes.forEach((note) => {
    grid.appendChild(createNoteCard(note));
  });
}

/* =========================================================
   FAVORITES
========================================================= */

function renderFavorites() {
  const grid = $("#favoritesGrid");

  const empty = $("#favoritesEmpty");

  const searchResults = getSearchResults(state.notes);

  const favorites = searchResults.filter((note) => note.favorite);

  grid.innerHTML = "";

  if (!favorites.length) {
    empty.style.display = "block";

    return;
  }

  empty.style.display = "none";

  favorites.forEach((note) => {
    grid.appendChild(createNoteCard(note));
  });
}

/* =========================================================
   CATEGORY
========================================================= */

function renderCategory() {
  const grid = $("#categoryGrid");

  const notes = getSearchResults(state.notes).filter(
    (note) => note.category === state.currentCategory,
  );

  grid.innerHTML = "";

  notes.forEach((note) => {
    grid.appendChild(createNoteCard(note));
  });
}

/* =========================================================
   TASKS
========================================================= */

function addTask() {
  const input = $("#taskInput");

  const text = input.value.trim();

  if (!text) {
    toast("Écrivez une tâche.", "error");

    input.focus();

    return;
  }

  const task = {
    id: generateId("task"),

    text,

    completed: false,

    priority: $("#taskPriority").value,

    createdAt: new Date().toISOString(),
  };

  state.tasks.unshift(task);

  save(STORAGE.tasks, state.tasks);

  input.value = "";

  toast("Tâche ajoutée ✓", "success");

  render();
}

$("#addTaskButton").addEventListener("click", addTask);

$("#taskInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

/* =========================================================
   TASK FILTER
========================================================= */

$$(".task-filter").forEach((button) => {
  button.addEventListener("click", () => {
    state.taskFilter = button.dataset.taskFilter;

    $$(".task-filter").forEach((item) =>
      item.classList.toggle("active", item === button),
    );

    renderTasks();
  });
});

/* =========================================================
   TASK CARD
========================================================= */

function createTask(task) {
  const item = document.createElement("div");

  item.className = "task-item";

  if (task.completed) {
    item.classList.add("completed");
  }

  item.innerHTML = `

    <button
      class="task-check"
      aria-label="Terminer"
    >
      ${task.completed ? '<i class="fa-solid fa-check"></i>' : ""}
    </button>


    <span class="task-text">
      ${escapeHTML(task.text)}
    </span>


    <span class="task-priority ${task.priority}">
      ${
        task.priority === "high"
          ? "HAUTE"
          : task.priority === "low"
            ? "FAIBLE"
            : "NORMALE"
      }
    </span>


    <span class="task-date">
      ${formatShortDate(task.createdAt)}
    </span>


    <button
      class="task-edit"
      aria-label="Modifier"
    >
      <i class="fa-solid fa-pen"></i>
    </button>


    <button
      class="task-delete"
      aria-label="Supprimer"
    >
      <i class="fa-regular fa-trash-can"></i>
    </button>

  `;

  item.querySelector(".task-check").addEventListener("click", () => {
    task.completed = !task.completed;

    save(STORAGE.tasks, state.tasks);

    render();
  });

  item.querySelector(".task-delete").addEventListener("click", () => {
    moveToTrash(task, "task");
  });

  item.querySelector(".task-edit").addEventListener("click", () => {
    const newText = prompt("Modifier la tâche :", task.text);

    if (newText && newText.trim()) {
      task.text = newText.trim();

      save(STORAGE.tasks, state.tasks);

      render();
    }
  });

  return item;
}

/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {
  const list = $("#tasksList");

  let tasks = [...state.tasks];

  if (state.taskFilter === "todo") {
    tasks = tasks.filter((task) => !task.completed);
  }

  if (state.taskFilter === "done") {
    tasks = tasks.filter((task) => task.completed);
  }

  list.innerHTML = "";

  if (!tasks.length) {
    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-check"></i>
        </div>

        <h3>Aucune tâche</h3>

        <p>
          Rien à afficher ici.
        </p>

      </div>

    `;

    return;
  }

  tasks.forEach((task) => {
    list.appendChild(createTask(task));
  });
}

/* =========================================================
   TRASH
========================================================= */

function moveToTrash(item, type) {
  state.trash.unshift({
    id: generateId("trash"),

    type,

    data: JSON.parse(JSON.stringify(item)),

    deletedAt: new Date().toISOString(),
  });

  if (type === "note") {
    state.notes = state.notes.filter((note) => note.id !== item.id);

    save(STORAGE.notes, state.notes);
  }

  if (type === "task") {
    state.tasks = state.tasks.filter((task) => task.id !== item.id);

    save(STORAGE.tasks, state.tasks);
  }

  save(STORAGE.trash, state.trash);

  toast("Déplacé dans la corbeille", "success");

  render();
}

/* =========================================================
   RENDER TRASH
========================================================= */

function renderTrash() {
  const list = $("#trashList");

  const empty = $("#trashEmpty");

  list.innerHTML = "";

  if (!state.trash.length) {
    empty.style.display = "block";

    return;
  }

  empty.style.display = "none";

  state.trash.forEach((deleted) => {
    const item = document.createElement("div");

    item.className = "trash-item";

    const name =
      deleted.type === "note" ? deleted.data.title : deleted.data.text;

    item.innerHTML = `

        <div class="trash-icon">
          <i class="${
            deleted.type === "note"
              ? "fa-regular fa-note-sticky"
              : "fa-solid fa-list-check"
          }"></i>
        </div>


        <div class="trash-info">

          <strong>
            ${escapeHTML(name)}
          </strong>

          <small>
            Supprimé le
            ${formatDate(deleted.deletedAt)}
          </small>

        </div>


        <div class="trash-actions">

          <button class="restore">
            Restaurer
          </button>

          <button class="delete">
            Supprimer
          </button>

        </div>

      `;

    item
      .querySelector(".restore")
      .addEventListener("click", () => restoreTrash(deleted.id));

    item
      .querySelector(".delete")
      .addEventListener("click", () => permanentlyDelete(deleted.id));

    list.appendChild(item);
  });
}

/* =========================================================
   RESTORE
========================================================= */

function restoreTrash(id) {
  const item = state.trash.find((element) => element.id === id);

  if (!item) return;

  if (item.type === "note") {
    state.notes.unshift(item.data);

    save(STORAGE.notes, state.notes);
  }

  if (item.type === "task") {
    state.tasks.unshift(item.data);

    save(STORAGE.tasks, state.tasks);
  }

  state.trash = state.trash.filter((element) => element.id !== id);

  save(STORAGE.trash, state.trash);

  toast("Élément restauré ✓", "success");

  render();
}

/* =========================================================
   PERMANENT DELETE
========================================================= */

function permanentlyDelete(id) {
  state.trash = state.trash.filter((item) => item.id !== id);

  save(STORAGE.trash, state.trash);

  toast("Supprimé définitivement");

  render();
}

/* =========================================================
   EMPTY TRASH
========================================================= */

$("#emptyTrash").addEventListener("click", () => {
  if (!state.trash.length) {
    toast("La corbeille est déjà vide.");

    return;
  }

  askConfirm(
    "Vider la corbeille ?",

    "Tous les éléments seront supprimés définitivement.",

    () => {
      state.trash = [];

      save(STORAGE.trash, state.trash);

      toast("Corbeille vidée ✓", "success");

      render();
    },
  );
});

/* =========================================================
   PROFILE
========================================================= */

function openProfile() {
  $("#profileName").value = state.profile.name || "";

  $("#profileEmail").value = state.profile.email || "";

  $("#profileGender").value = state.profile.gender || "Homme";

  openModal("profileModal");
}

$("#profileButton").addEventListener("click", openProfile);

$("#profileTopButton").addEventListener("click", openProfile);

$("#saveProfile").addEventListener("click", () => {
  state.profile = {
    name: $("#profileName").value.trim(),

    email: $("#profileEmail").value.trim(),

    gender: $("#profileGender").value,
  };

  save(STORAGE.profile, state.profile);

  $("#sidebarUser").textContent = state.profile.name || "Mon profil";

  $("#pageTitle").textContent = getGreeting();

  closeModal("profileModal");

  toast("Profil enregistré ✓", "success");
});

$("#closeProfile").addEventListener("click", () => closeModal("profileModal"));

/* =========================================================
   MODALS
========================================================= */

function openModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.add("open");

  modal.setAttribute("aria-hidden", "false");
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute("aria-hidden", "true");
}

$("#closeTheme").addEventListener("click", () => closeModal("themeModal"));

$$(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal.id);
    }
  });
});

/* =========================================================
   CONFIRM
========================================================= */

function askConfirm(title, text, callback) {
  $("#confirmTitle").textContent = title;

  $("#confirmText").textContent = text;

  state.pendingConfirm = callback;

  openModal("confirmModal");
}

$("#cancelConfirm").addEventListener("click", () => {
  state.pendingConfirm = null;

  closeModal("confirmModal");
});

$("#confirmAction").addEventListener("click", () => {
  if (typeof state.pendingConfirm === "function") {
    state.pendingConfirm();
  }

  state.pendingConfirm = null;

  closeModal("confirmModal");
});

/* =========================================================
   STATS
========================================================= */

function updateStats() {
  const notes = state.notes.length;

  const favorites = state.notes.filter((note) => note.favorite).length;

  const tasks = state.tasks.length;

  const completed = state.tasks.filter((task) => task.completed).length;

  $("#notesCount").textContent = notes;

  $("#favoritesCount").textContent = favorites;

  $("#tasksCount").textContent = tasks;

  $("#trashCount").textContent = state.trash.length;

  $("#statNotes").textContent = notes;

  $("#statFavorites").textContent = favorites;

  $("#statCompleted").textContent = completed;

  $("#statTasks").textContent = `${tasks} tâche${tasks > 1 ? "s" : ""}`;

  const percentage = tasks === 0 ? 0 : Math.round((completed / tasks) * 100);

  $("#progressValue").textContent = `${percentage}%`;

  $("#progressValue").parentElement.style.setProperty(
    "--progress",
    `${percentage}%`,
  );

  $("#sidebarUser").textContent = state.profile.name || "Mon profil";
}

/* =========================================================
   RENDER
========================================================= */

function render() {
  renderNotes();

  renderFavorites();

  renderTasks();

  renderTrash();

  updateStats();

  if (state.currentCategory) {
    renderCategory();
  }
}

/* =========================================================
   INITIAL PROFILE
========================================================= */

$("#sidebarUser").textContent = state.profile.name || "Mon profil";

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener("keydown", (event) => {
  const modifier = event.ctrlKey || event.metaKey;

  if (modifier && event.key.toLowerCase() === "k") {
    event.preventDefault();

    $("#searchInput").focus();
  }

  if (modifier && event.key.toLowerCase() === "n") {
    event.preventDefault();

    openNoteEditor();
  }

  if (event.key === "Escape") {
    $$(".modal.open").forEach((modal) => closeModal(modal.id));

    closeSidebar();
  }
});

/* =========================================================
   AUTO SAVE INDICATOR
========================================================= */

let autosaveTimer;

quill.on("text-change", () => {
  $("#editorSaveState").textContent = "Modifications non enregistrées";

  clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(() => {
    $("#editorSaveState").textContent = "Prêt à enregistrer";
  }, 1000);
});

/* =========================================================
   PROFILE ENTER KEY
========================================================= */

$("#profileName").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    $("#saveProfile").click();
  }
});

/* =========================================================
   INITIAL RENDER
========================================================= */

render();

/* =========================================================
   WELCOME MESSAGE
========================================================= */

setTimeout(() => {
  if (!localStorage.getItem("notes_remaster_welcome")) {
    toast("Bienvenue dans votre nouvel espace Notes ✨", "success");

    localStorage.setItem("notes_remaster_welcome", "true");
  }
}, 700);
