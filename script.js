const form = document.querySelector("#event-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const dateInput = document.querySelector("#date");
const datePreview = document.querySelector("#date-preview");
const eventList = document.querySelector("#event-list");
const emptyState = document.querySelector("#empty-state");
const eventCounter = document.querySelector("#event-counter");
const feedback = document.querySelector("#feedback");

let events = [];
let editingEventId = null;

bootstrap();
registerServiceWorker();
syncDatePreview();

dateInput.addEventListener("input", syncDatePreview);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const date = dateInput.value;

  if (!title || !description) {
    setFeedback("Compila titolo e descrizione.", "error");
    return;
  }

  setFeedback("Salvataggio in corso...", "info");

  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        date: date || null,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Salvataggio non riuscito.");
    }

    events = payload.events;
    renderEvents();
    form.reset();
    syncDatePreview();
    titleInput.focus();
    setFeedback("Evento salvato correttamente.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante il salvataggio.", "error");
  }
});

eventList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (!id) {
    return;
  }

  if (action === "toggle-complete") {
    await updateEventStatus(id, button.dataset.completed !== "true");
    return;
  }

  if (action === "start-edit") {
    editingEventId = id;
    renderEvents();
    return;
  }

  if (action === "cancel-edit") {
    editingEventId = null;
    renderEvents();
    setFeedback("Modifica annullata.", "info");
    return;
  }

  if (action === "delete") {
    await deleteEvent(id);
  }
});

eventList.addEventListener("submit", async (event) => {
  const editForm = event.target.closest("form[data-role='edit-event']");

  if (!editForm) {
    return;
  }

  event.preventDefault();

  const formData = new FormData(editForm);
  const id = editForm.dataset.id;

  await saveEventEdit(id, {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    date: String(formData.get("date") || "").trim(),
  });
});

async function bootstrap() {
  setFeedback("Caricamento eventi...", "info");

  try {
    const response = await fetch("/api/events");
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Caricamento non riuscito.");
    }

    events = payload.events;
    renderEvents();
    setFeedback("", "");
  } catch (error) {
    events = [];
    renderEvents();
    setFeedback(error.message || "Impossibile caricare gli eventi.", "error");
  }
}

function renderEvents() {
  eventList.innerHTML = "";

  if (events.length === 0) {
    emptyState.classList.remove("hidden");
    eventCounter.textContent = "Nessun evento salvato.";
    return;
  }

  emptyState.classList.add("hidden");
  eventCounter.textContent =
    events.length === 1 ? "1 evento salvato." : `${events.length} eventi salvati.`;

  for (const item of events) {
    const listItem = document.createElement("li");
    listItem.className = item.completed ? "event-card is-completed" : "event-card";

    const scheduledAt = item.scheduledAt || item.date;
    const dateMarkup = scheduledAt
      ? `<span class="event-date">${escapeHtml(formatEventDate(scheduledAt))}</span>`
      : "";
    const statusMarkup = item.completed
      ? '<span class="event-status event-status-done">Fatta</span>'
      : '<span class="event-status event-status-open">Da fare</span>';
    const completedMarkup =
      item.completed && item.completedAt
        ? `<p class="event-completed-at">Completata il ${escapeHtml(
            formatCreatedAt(item.completedAt)
          )}</p>`
        : "";
    const isEditing = editingEventId === item.id;
    const editMarkup = isEditing
      ? `
        <form class="edit-event-form" data-role="edit-event" data-id="${escapeHtml(item.id)}">
          <label>
            Titolo
            <input name="title" type="text" value="${escapeHtml(item.title)}" required />
          </label>
          <label>
            Descrizione
            <textarea name="description" rows="3" required>${escapeHtml(item.description)}</textarea>
          </label>
          <label>
            Data e ora opzionali
            <input
              name="date"
              type="datetime-local"
              value="${escapeHtml(toDateTimeLocalValue(scheduledAt))}"
            />
          </label>
          <div class="edit-event-actions">
            <button type="submit" class="card-action card-action-primary">Salva modifiche</button>
            <button type="button" class="card-action" data-action="cancel-edit" data-id="${escapeHtml(
              item.id
            )}">Annulla</button>
          </div>
        </form>
      `
      : "";

    listItem.innerHTML = `
      <div class="event-meta">
        <div class="event-heading">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="event-badges">
            ${statusMarkup}
            ${dateMarkup}
          </div>
        </div>
        <div class="event-actions">
          <button
            type="button"
            class="card-action"
            data-action="start-edit"
            data-id="${escapeHtml(item.id)}"
          >
            Modifica
          </button>
          <button
            type="button"
            class="card-action"
            data-action="toggle-complete"
            data-id="${escapeHtml(item.id)}"
            data-completed="${item.completed ? "true" : "false"}"
          >
            ${item.completed ? "Segna come da fare" : "Segna come fatta"}
          </button>
          <button
            type="button"
            class="card-action card-action-danger"
            data-action="delete"
            data-id="${escapeHtml(item.id)}"
          >
            Elimina
          </button>
        </div>
      </div>
      <p class="event-description">${escapeHtml(item.description)}</p>
      <p class="event-created-at">Creato il ${escapeHtml(formatCreatedAt(item.createdAt))}</p>
      ${completedMarkup}
      ${editMarkup}
    `;

    eventList.appendChild(listItem);
  }
}

function setFeedback(message, tone) {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function syncDatePreview() {
  if (!dateInput.value) {
    datePreview.textContent = "Nessuna data selezionata";
    datePreview.dataset.active = "false";
    return;
  }

  datePreview.textContent = formatEventDate(dateInput.value);
  datePreview.dataset.active = "true";
}

function formatEventDate(dateValue) {
  const hasTime = dateValue.includes("T");
  const normalizedValue = hasTime ? dateValue : `${dateValue}T12:00`;

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    ...(hasTime ? { timeStyle: "short" } : {}),
  }).format(new Date(normalizedValue));
}

function formatCreatedAt(dateValue) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  return value.length === 10 ? `${value}T12:00` : value;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {
      setFeedback("Installazione offline non disponibile in questo momento.", "info");
    }
  });
}

async function updateEventStatus(id, completed) {
  setFeedback("Aggiornamento evento...", "info");

  try {
    const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Aggiornamento non riuscito.");
    }

    events = payload.events;
    editingEventId = null;
    renderEvents();
    setFeedback(completed ? "Attivita' segnata come fatta." : "Attivita' riaperta.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante l'aggiornamento.", "error");
  }
}

async function deleteEvent(id) {
  setFeedback("Eliminazione in corso...", "info");

  try {
    const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Eliminazione non riuscita.");
    }

    events = payload.events;
    editingEventId = null;
    renderEvents();
    setFeedback("Attivita' eliminata.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante l'eliminazione.", "error");
  }
}

async function saveEventEdit(id, values) {
  if (!values.title || !values.description) {
    setFeedback("Titolo e descrizione sono obbligatori.", "error");
    return;
  }

  setFeedback("Salvataggio modifiche...", "info");

  try {
    const response = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        date: values.date || null,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Modifica non riuscita.");
    }

    events = payload.events;
    editingEventId = null;
    renderEvents();
    setFeedback("Evento modificato correttamente.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante la modifica.", "error");
  }
}
