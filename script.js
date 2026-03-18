const form = document.querySelector("#event-form");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const dateInput = document.querySelector("#date");
const eventList = document.querySelector("#event-list");
const emptyState = document.querySelector("#empty-state");
const eventCounter = document.querySelector("#event-counter");
const feedback = document.querySelector("#feedback");

let events = [];

bootstrap();
registerServiceWorker();

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
    listItem.className = "event-card";

    const dateMarkup = item.date
      ? `<span class="event-date">${formatEventDate(item.date)}</span>`
      : "";

    listItem.innerHTML = `
      <div class="event-meta">
        <h3>${escapeHtml(item.title)}</h3>
        ${dateMarkup}
      </div>
      <p class="event-description">${escapeHtml(item.description)}</p>
      <p class="event-created-at">Creato il ${formatCreatedAt(item.createdAt)}</p>
    `;

    eventList.appendChild(listItem);
  }
}

function setFeedback(message, tone) {
  feedback.textContent = message;
  feedback.dataset.tone = tone;
}

function formatEventDate(dateValue) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
  }).format(new Date(`${dateValue}T12:00:00`));
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
