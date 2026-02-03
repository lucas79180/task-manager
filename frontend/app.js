// Change this if your API runs elsewhere (CI, container, remote)
const API_URL = localStorage.getItem("API_URL") || "http://127.0.0.1:8000";
document.getElementById("apiUrlLabel").textContent = API_URL;

async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

function taskCard(task) {
  const div = document.createElement("div");
  div.className = "task";
  const row = document.createElement("div");
  row.className = "row";

  const title = document.createElement("h3");
  title.textContent = task.title || "";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = task.status || "";

  row.appendChild(title);
  row.appendChild(badge);

  const description = document.createElement("p");
  if (task.description) {
    description.textContent = task.description;
  } else {
    const em = document.createElement("em");
    em.textContent = "Pas de description";
    description.appendChild(em);
  }

  const meta = document.createElement("small");
  meta.textContent = `id=${task.id} â€¢ crÃ©Ã©=${new Date(
    task.created_at
  ).toLocaleString()}`;

  const actions = document.createElement("div");
  actions.className = "actions";

  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("data-role", "status");
  ["TODO", "DOING", "DONE"].forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (task.status === value) option.selected = true;
    statusSelect.appendChild(option);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "secondary";
  saveBtn.setAttribute("data-role", "save");
  saveBtn.textContent = "Mettre Ã  jour";

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("data-role", "delete");
  deleteBtn.textContent = "Supprimer";

  actions.appendChild(statusSelect);
  actions.appendChild(saveBtn);
  actions.appendChild(deleteBtn);

  div.appendChild(row);
  div.appendChild(description);
  div.appendChild(meta);
  div.appendChild(actions);

  saveBtn.addEventListener("click", async () => {
    const status = div.querySelector('[data-role="status"]').value;
    await api(`/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    await refresh();
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Supprimer cette tÃ¢che ?")) return;
    await api(`/tasks/${task.id}`, { method: "DELETE" });
    await refresh();
  });

  return div;
}

async function refresh() {
  const container = document.getElementById("tasks");
  container.textContent = "";
  try {
    const tasks = await api("/tasks");
    if (tasks.length === 0) {
      const empty = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = "Aucune tÃ¢che pour lâ€™instant.";
      empty.appendChild(em);
      container.appendChild(empty);
      return;
    }
    tasks.forEach((t) => container.appendChild(taskCard(t)));
  } catch (e) {
    const errorP = document.createElement("p");
    errorP.style.color = "#b00020";
    const strong = document.createElement("strong");
    strong.textContent = "Erreur:";
    errorP.appendChild(strong);
    errorP.appendChild(document.createTextNode(` ${e.message}`));

    const hintP = document.createElement("p");
    hintP.appendChild(
      document.createTextNode("VÃ©rifie que lâ€™API tourne sur ")
    );
    const code = document.createElement("code");
    code.textContent = API_URL;
    hintP.appendChild(code);
    hintP.appendChild(document.createTextNode("."));

    container.appendChild(errorP);
    container.appendChild(hintP);
  }
}

document.getElementById("refreshBtn").addEventListener("click", refresh);

document.getElementById("createForm").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim() || null;

  await api("/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  await refresh();
});

refresh();
