const form = document.querySelector("#event-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const dateInput = document.querySelector("#date");
<<<<<<< HEAD
const datePreview = document.querySelector("#date-preview");
=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
const eventList = document.querySelector("#event-list");
const emptyState = document.querySelector("#empty-state");
const eventCounter = document.querySelector("#event-counter");
const feedback = document.querySelector("#feedback");

let events = [];

bootstrap();
registerServiceWorker();
<<<<<<< HEAD
syncDatePreview();

dateInput.addEventListener("input", syncDatePreview);
=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a

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
    titleInput.focus();
    setFeedback("Evento salvato correttamente.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante il salvataggio.", "error");
  }
});

<<<<<<< HEAD
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

  if (action === "delete") {
    await deleteEvent(id);
  }
});

=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
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
<<<<<<< HEAD
    listItem.className = item.completed ? "event-card is-completed" : "event-card";

    const scheduledAt = item.scheduledAt || item.date;
    const dateMarkup = scheduledAt
      ? `<span class="event-date">${formatEventDate(scheduledAt)}</span>`
      : "";
    const statusMarkup = item.completed
      ? `<span class="event-status event-status-done">Fatta</span>`
      : `<span class="event-status event-status-open">Da fare</span>`;
    const completedMarkup = item.completed && item.completedAt
      ? `<p class="event-completed-at">Completata il ${formatCreatedAt(item.completedAt)}</p>`
=======
    listItem.className = "event-card";

    const dateMarkup = item.date
      ? `<span class="event-date">${formatEventDate(item.date)}</span>`
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
      : "";

    listItem.innerHTML = `
      <div class="event-meta">
<<<<<<< HEAD
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
            data-action="toggle-complete"
            data-id="${item.id}"
            data-completed="${item.completed ? "true" : "false"}"
          >
            ${item.completed ? "Segna come da fare" : "Segna come fatta"}
          </button>
          <button
            type="button"
            class="card-action card-action-danger"
            data-action="delete"
            data-id="${item.id}"
          >
            Elimina
          </button>
        </div>
      </div>
      <p class="event-description">${escapeHtml(item.description)}</p>
      <p class="event-created-at">Creato il ${formatCreatedAt(item.createdAt)}</p>
      ${completedMarkup}
=======
        <h3>${escapeHtml(item.title)}</h3>
        ${dateMarkup}
      </div>
      <p class="event-description">${escapeHtml(item.description)}</p>
      <p class="event-created-at">Creato il ${formatCreatedAt(item.createdAt)}</p>
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
    `;

    eventList.appendChild(listItem);
  }
}

function setFeedback(message, tone) {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function formatEventDate(dateValue) {
<<<<<<< HEAD
  const hasTime = dateValue.includes("T");
  const normalizedValue = hasTime ? dateValue : `${dateValue}T12:00`;

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    ...(hasTime ? { timeStyle: "short" } : {}),
  }).format(new Date(normalizedValue));
}

function syncDatePreview() {
  if (!dateInput.value) {
    datePreview.textContent = "Nessuna data selezionata";
    datePreview.dataset.active = "false";
    return;
  }

  datePreview.textContent = formatEventDate(dateInput.value);
  datePreview.dataset.active = "true";
=======
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
  }).format(new Date(`${dateValue}T12:00:00`));
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
}

function formatCreatedAt(dateValue) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

function escapeHtml(value) {
  return value
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
<<<<<<< HEAD

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
    renderEvents();
    setFeedback("Attivita' eliminata.", "success");
  } catch (error) {
    setFeedback(error.message || "Errore durante l'eliminazione.", "error");
  }
}
=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
