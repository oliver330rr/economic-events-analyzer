const STORAGE_KEY = "meu-dia-tasks-v1";
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const remainingCount = document.querySelector("#remaining-count");
const totalCount = document.querySelector("#total-count");
const clearDoneButton = document.querySelector("#clear-done");
const filters = [...document.querySelectorAll(".filter")];
const toast = document.querySelector("#toast");

let tasks = readTasks();
let activeFilter = "all";
let toastTimer;

function readTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((task) => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.done === "boolean");
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    showToast("Não foi possível salvar. Verifique o espaço do navegador.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setFilter(filter) {
  activeFilter = filter;
  filters.forEach((button) => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  render();
}

function createIconButton(label, symbol, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${className}`;
  button.setAttribute("aria-label", label);
  button.textContent = symbol;
  return button;
}

function render() {
  const visible = tasks.filter((task) => activeFilter === "all" || (activeFilter === "active" ? !task.done : task.done));
  const left = tasks.filter((task) => !task.done).length;
  taskList.replaceChildren();

  visible.forEach((task) => {
    const row = document.createElement("li");
    row.className = `task-row${task.done ? " is-done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `${task.done ? "Reabrir" : "Concluir"} tarefa: ${task.text}`);
    checkbox.addEventListener("change", () => updateTask(task.id, { done: checkbox.checked }));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";
    const edit = createIconButton(`Editar tarefa: ${task.text}`, "✎", "edit-action");
    edit.addEventListener("click", () => editTask(task));
    const remove = createIconButton(`Excluir tarefa: ${task.text}`, "×", "delete-action");
    remove.addEventListener("click", () => deleteTask(task.id));
    actions.append(edit, remove);

    row.append(checkbox, text, actions);
    taskList.append(row);
  });

  emptyState.hidden = visible.length > 0;
  if (tasks.length === 0) {
    emptyTitle.textContent = "Tudo tranquilo por aqui";
    emptyCopy.textContent = "Adicione uma tarefa para começar seu dia.";
  } else if (visible.length === 0) {
    emptyTitle.textContent = activeFilter === "active" ? "Você terminou tudo!" : "Ainda não há tarefas concluídas";
    emptyCopy.textContent = activeFilter === "active" ? "Aproveite esse respiro." : "As tarefas que concluir aparecem aqui.";
  }

  remainingCount.textContent = `${left} ${left === 1 ? "tarefa pendente" : "tarefas pendentes"}`;
  totalCount.textContent = `${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"}`;
  clearDoneButton.disabled = !tasks.some((task) => task.done);
}

function updateTask(id, changes) {
  tasks = tasks.map((task) => task.id === id ? { ...task, ...changes } : task);
  persist();
  render();
}

function editTask(task) {
  const answer = window.prompt("Editar tarefa:", task.text);
  if (answer === null) return;
  const text = answer.trim();
  if (!text) {
    showToast("A tarefa não pode ficar vazia.");
    return;
  }
  updateTask(task.id, { text: text.slice(0, 180) });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  persist();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const id = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  tasks.unshift({ id, text: text.slice(0, 180), done: false, createdAt: new Date().toISOString() });
  persist();
  input.value = "";
  setFilter("all");
  input.focus();
});

filters.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filter)));
clearDoneButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  persist();
  render();
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long", day: "numeric", month: "long",
}).format(new Date());

// Keep multiple open tabs in sync when localStorage changes.
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY || event.key === null) {
    tasks = readTasks();
    render();
  }
});

render();
