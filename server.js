const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3000;
const APP_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(APP_DIR, "data");
const DATA_FILE = path.join(DATA_DIR, "events.json");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

let writeQueue = Promise.resolve();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
<<<<<<< HEAD
    const eventIdMatch = url.pathname.match(/^\/api\/events\/([^/]+)$/);
=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a

    if (url.pathname === "/api/events" && request.method === "GET") {
      const events = await getEvents();
      return sendJson(response, 200, { events });
    }

    if (url.pathname === "/api/events" && request.method === "POST") {
      const body = await readJsonBody(request);
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const description =
        typeof body.description === "string" ? body.description.trim() : "";
<<<<<<< HEAD
      const scheduledAt = normalizeScheduledAt(body.date);
=======
      const date = normalizeDate(body.date);
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a

      if (!title || !description) {
        return sendJson(response, 400, {
          error: "Titolo e descrizione sono obbligatori.",
        });
      }

      const events = await updateEvents((currentEvents) => {
        const nextEvents = purgeExpiredEvents(currentEvents);

        nextEvents.unshift({
          id: randomUUID(),
          title,
          description,
<<<<<<< HEAD
          scheduledAt,
          completed: false,
          completedAt: null,
=======
          date,
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
          createdAt: new Date().toISOString(),
        });

        return nextEvents;
      });

      return sendJson(response, 201, { events });
    }

<<<<<<< HEAD
    if (eventIdMatch && request.method === "PATCH") {
      const body = await readJsonBody(request);
      const eventId = decodeURIComponent(eventIdMatch[1]);

      const events = await updateEvents((currentEvents) => {
        const nextEvents = purgeExpiredEvents(currentEvents);
        const eventIndex = nextEvents.findIndex((item) => item.id === eventId);

        if (eventIndex === -1) {
          throw new Error("NOT_FOUND");
        }

        const currentEvent = nextEvents[eventIndex];
        const completed = body.completed === undefined
          ? !currentEvent.completed
          : Boolean(body.completed);

        nextEvents[eventIndex] = {
          ...currentEvent,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        };

        return nextEvents;
      });

      return sendJson(response, 200, { events });
    }

    if (eventIdMatch && request.method === "DELETE") {
      const eventId = decodeURIComponent(eventIdMatch[1]);

      const events = await updateEvents((currentEvents) => {
        const nextEvents = purgeExpiredEvents(currentEvents);
        const filteredEvents = nextEvents.filter((item) => item.id !== eventId);

        if (filteredEvents.length === nextEvents.length) {
          throw new Error("NOT_FOUND");
        }

        return filteredEvents;
      });

      return sendJson(response, 200, { events });
    }

=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
    if (request.method === "GET") {
      return serveStaticFile(url.pathname, response);
    }

    sendJson(response, 405, { error: "Metodo non supportato." });
  } catch (error) {
<<<<<<< HEAD
    if (error.message === "NOT_FOUND") {
      return sendJson(response, 404, {
        error: "Evento non trovato.",
      });
    }

    if (error instanceof SyntaxError) {
      return sendJson(response, 400, {
        error: "Corpo della richiesta non valido.",
      });
    }

=======
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
    sendJson(response, 500, {
      error: "Errore interno del server.",
      details: error.message,
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});

async function getEvents() {
  const events = await readEventsFromFile();
  const activeEvents = purgeExpiredEvents(events);

  if (activeEvents.length !== events.length) {
    await writeEventsToFile(activeEvents);
  }

  return activeEvents;
}

async function updateEvents(transform) {
  writeQueue = writeQueue.then(async () => {
    const currentEvents = await readEventsFromFile();
    const nextEvents = transform(currentEvents);
    await writeEventsToFile(nextEvents);
    return nextEvents;
  });

  return writeQueue;
}

async function readEventsFromFile() {
  await ensureDataFile();

  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);

  return Array.isArray(parsed) ? parsed : [];
}

async function writeEventsToFile(events) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2));
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n");
  }
}

function purgeExpiredEvents(events) {
  const today = new Date();
  const todayKey = formatDateKey(today);

  return events.filter((event) => {
<<<<<<< HEAD
    const scheduledAt = normalizeScheduledAt(event.scheduledAt || event.date);

    if (!scheduledAt) {
      return true;
    }

    return getEventDayKey(scheduledAt) >= todayKey;
=======
    if (!event.date) {
      return true;
    }

    return event.date >= todayKey;
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
  });
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

<<<<<<< HEAD
function normalizeScheduledAt(value) {
=======
function normalizeDate(value) {
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
  if (!value) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

<<<<<<< HEAD
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function getEventDayKey(scheduledAt) {
  return scheduledAt.slice(0, 10);
=======
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
>>>>>>> d0d96dcf53324e79ed9111837458198c268f293a
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStaticFile(urlPath, response) {
  const relativePath = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(APP_DIR, safePath);

  if (!filePath.startsWith(APP_DIR)) {
    return sendText(response, 403, "Accesso negato.");
  }

  try {
    const extension = path.extname(filePath);
    const contentType = MIME_TYPES[extension] || "text/plain; charset=utf-8";
    const file = await fs.readFile(filePath);

    response.writeHead(200, { "Content-Type": contentType });
    response.end(file);
  } catch {
    sendText(response, 404, "File non trovato.");
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}
