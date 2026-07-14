
const form = document.getElementById("prompt-form");
const input = document.getElementById("prompt-input");
const log = document.getElementById("conversation-log");
const suggestions = document.getElementById("suggestions");
const submitButton = form?.querySelector("button[type='submit']");
const resetButton = document.getElementById("reset-chat");
const aiStatus = document.getElementById("ai-status");
const characterCounter = document.getElementById("character-counter");

const stageLabel = document.getElementById("conversation-stage");
const turnCounter = document.getElementById("conversation-counter");
const progressBar = document.getElementById("progress-bar");
const thinkingStrip = document.getElementById("thinking-strip");
const thinkingTitle = document.getElementById("thinking-title");
const thinkingCopy = document.getElementById("thinking-copy");

const insightTitle = document.getElementById("insight-title");
const insightCopy = document.getElementById("insight-copy");
const opportunities = document.getElementById("opportunities");
const clients = document.getElementById("clients");
const spaces = document.getElementById("spaces");
const impact = document.getElementById("impact");
const centerLabel = document.getElementById("center-label");
const dataQuality = document.getElementById("data-quality");
const dashboardOnlineCopy = document.getElementById("dashboard-online-copy");

const memoryPanel = document.getElementById("memory-panel");
const memoryBody = document.getElementById("memory-body");
const toggleMemory = document.getElementById("toggle-memory");
const memoryCenter = document.getElementById("memory-center");
const memoryCabins = document.getElementById("memory-cabins");
const memoryTeam = document.getElementById("memory-team");
const memoryPriority = document.getElementById("memory-priority");
const memoryGoal = document.getElementById("memory-goal");
const memoryMaturity = document.getElementById("memory-maturity");

const MAX_TURNS = 10;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const INITIAL_MESSAGE = "Raccontami brevemente come lavora il tuo centro e qual è il problema più importante. Ti mostrerò come ragiono, senza sostituire l’analisi completa riservata ad AESTRA.";

let lastActivityAt = Date.now();
let conversation = [];
let turns = 0;
let closed = false;
let profile = emptyProfile();

function emptyProfile() {
  return {
    centerName: "",
    centerType: "",
    cabins: null,
    team: null,
    priority: "",
    goal: "",
    maturity: "In valutazione"
  };
}

suggestions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-prompt]");
  if (!button || closed) return;
  input.value = button.dataset.prompt;
  updateCharacterCounter();
  input.focus();
});

input?.addEventListener("input", updateCharacterCounter);

toggleMemory?.addEventListener("click", () => {
  memoryBody.classList.toggle("open");
  toggleMemory.textContent = memoryBody.classList.contains("open") ? "Nascondi" : "Mostra";
});

resetButton?.addEventListener("click", resetConversation);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function addConversationEntry(role, text, kind = "") {
  const entry = document.createElement("div");
  let className = role === "user" ? "user-entry" : "daphne-entry";
  if (kind === "sales") className += " sales-entry";
  if (kind === "boundary") className += " boundary-entry";
  if (kind === "error") className += " error-entry";

  entry.className = `conversation-entry ${className}`;
  entry.innerHTML = `<span>${role === "user" ? "Tu" : "Daphne"}</span><p>${escapeHtml(text)}</p>`;
  log.appendChild(entry);
  log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
}

function updateCharacterCounter() {
  const length = input?.value.length || 0;
  characterCounter.textContent = `${length} / 1800`;
  characterCounter.style.opacity = length > 1600 ? "1" : ".7";
}

function stageForTurn(turn) {
  if (turn <= 2) return "1 · Conoscenza";
  if (turn <= 5) return "2 · Prima lettura";
  if (turn <= 7) return "3 · Valore di AESTRA";
  return "4 · Prossimo passo";
}

function updateProgress() {
  stageLabel.textContent = stageForTurn(turns);
  turnCounter.textContent = `${turns} di ${MAX_TURNS} scambi`;
  progressBar.style.width = `${Math.min(100, (turns / MAX_TURNS) * 100)}%`;
}

function knownProfileFields() {
  return [
    profile.centerName || profile.centerType,
    Number.isFinite(profile.cabins),
    Number.isFinite(profile.team),
    profile.priority,
    profile.goal,
    profile.maturity && profile.maturity !== "In valutazione"
  ].filter(Boolean).length;
}

function markKnown(element, known) {
  element.closest("div")?.classList.toggle("is-known", Boolean(known));
}

function updateMemory(openOnNewData = false) {
  const before = memoryBody.querySelectorAll(".is-known").length;

  memoryCenter.textContent = profile.centerName || profile.centerType || "Non ancora indicato";
  memoryCabins.textContent = Number.isFinite(profile.cabins) ? profile.cabins : "—";
  memoryTeam.textContent = Number.isFinite(profile.team) ? profile.team : "—";
  memoryPriority.textContent = profile.priority || "Da definire";
  memoryGoal.textContent = profile.goal || "Da definire";
  memoryMaturity.textContent = profile.maturity || "In valutazione";

  markKnown(memoryCenter, profile.centerName || profile.centerType);
  markKnown(memoryCabins, Number.isFinite(profile.cabins));
  markKnown(memoryTeam, Number.isFinite(profile.team));
  markKnown(memoryPriority, profile.priority);
  markKnown(memoryGoal, profile.goal);
  markKnown(memoryMaturity, profile.maturity && profile.maturity !== "In valutazione");

  const known = knownProfileFields();
  memoryPanel.classList.toggle("has-data", known > 0);

  if (profile.centerName) {
    centerLabel.textContent = profile.centerName;
  } else if (profile.centerType) {
    centerLabel.textContent = profile.centerType;
  } else {
    centerLabel.textContent = "Il tuo centro";
  }

  if (openOnNewData && known > before && !memoryBody.classList.contains("open")) {
    memoryBody.classList.add("open");
    toggleMemory.textContent = "Nascondi";
  }

  if (known === 0) {
    thinkingTitle.textContent = "Sto iniziando a conoscere il tuo centro";
    thinkingCopy.textContent = "Le informazioni utili compariranno nella Memoria Strategica.";
  } else if (known <= 2) {
    thinkingTitle.textContent = "Ho iniziato a costruire il profilo";
    thinkingCopy.textContent = "Mi manca ancora qualche elemento per formulare una prima lettura.";
  } else if (known <= 4) {
    thinkingTitle.textContent = "Il profilo sta diventando più chiaro";
    thinkingCopy.textContent = "Sto collegando struttura, priorità e obiettivo.";
  } else {
    thinkingTitle.textContent = "Conosco già gli elementi essenziali";
    thinkingCopy.textContent = "Dentro AESTRA questa memoria diventerebbe operativa e permanente.";
  }

  const qualityLabels = ["Dati iniziali", "Profilo parziale", "Profilo utile", "Profilo completo"];
  const qualityIndex = known <= 1 ? 0 : known <= 3 ? 1 : known <= 5 ? 2 : 3;
  dataQuality.textContent = qualityLabels[qualityIndex];
}

function animateKpis() {
  document.querySelectorAll(".kpis article").forEach((card) => {
    card.classList.remove("updated");
    void card.offsetWidth;
    card.classList.add("updated");
  });
}

function updateDashboard(data = {}) {
  const dashboard = data.dashboard || {};

  insightTitle.textContent = dashboard.title || "Dimmi come lavori.";
  insightCopy.textContent = dashboard.copy || "Trasformerò le tue parole in una prima lettura operativa.";
  opportunities.textContent = dashboard.opportunities ?? "—";
  clients.textContent = dashboard.clients ?? "—";
  spaces.textContent = dashboard.spaces ?? "—";
  impact.textContent = dashboard.impact || "—";

  dashboardOnlineCopy.textContent = turns ? "Daphne sta costruendo la lettura" : "Daphne è pronta";
  animateKpis();

  document.querySelectorAll(".chart div").forEach((bar, index) => {
    const neutral = [28, 34, 31, 40, 45, 51, 58];
    const growth = Math.min(24, turns * 3);
    bar.style.height = `${neutral[index] + growth + index * 2}%`;
  });
}

function setBusy(busy) {
  submitButton.disabled = busy;
  input.disabled = busy || closed;
  thinkingStrip.classList.toggle("active", busy);

  if (busy) {
    aiStatus.textContent = "sta pensando…";
    aiStatus.className = "thinking";
    dashboardOnlineCopy.textContent = "Daphne sta elaborando";
    submitButton.innerHTML = "Daphne sta pensando…";
  } else {
    aiStatus.textContent = closed ? "sessione conclusa" : "online";
    aiStatus.className = "";
    dashboardOnlineCopy.textContent = closed ? "Prima lettura conclusa" : (turns ? "Daphne sta costruendo la lettura" : "Daphne è pronta");
    submitButton.innerHTML = 'Invia a Daphne <span>→</span>';
  }
}

function renderSuggestions() {
  if (closed) {
    suggestions.innerHTML = `
      <button data-prompt="" disabled>La conversazione pubblica è conclusa</button>
    `;
    return;
  }

  const items = [];
  if (!profile.centerType && !profile.centerName) {
    items.push(["Ho un centro estetico indipendente.", "Descrivi il centro"]);
  }
  if (!Number.isFinite(profile.cabins) || !Number.isFinite(profile.team)) {
    items.push(["Il centro ha 4 cabine e lavoriamo in 6 persone.", "Indica struttura e team"]);
  }
  if (!profile.priority) {
    items.push(["Il problema principale è che molte clienti non tornano.", "Indica il problema"]);
  }
  if (!profile.goal) {
    items.push(["Il mio obiettivo è aumentare il fatturato senza alzare i prezzi.", "Indica l’obiettivo"]);
  }
  if (turns >= 4) {
    items.push(["Cosa potresti fare per me dentro AESTRA?", "Scopri Daphne in AESTRA"]);
  }
  if (turns >= 6) {
    items.push(["Come posso prenotare una demo personalizzata?", "Prenota una demo"]);
  }

  const unique = items.slice(0, 3);
  suggestions.innerHTML = unique.map(([prompt, label]) =>
    `<button data-prompt="${escapeHtml(prompt)}">${escapeHtml(label)}</button>`
  ).join("");
}

function addConversionCard(data) {
  if (!data?.show) return;

  const existing = document.querySelector(".sales-gate[data-ai='true']");
  if (existing) existing.remove();

  const gate = document.createElement("div");
  gate.className = "sales-gate";
  gate.dataset.ai = "true";
  gate.innerHTML = `
    <strong>${escapeHtml(data.title || "Vuoi vedere Daphne lavorare sui dati reali?")}</strong>
    <span>${escapeHtml(data.copy || "Dentro AESTRA posso analizzare agenda, clienti, team e numeri reali ogni giorno.")}</span>
    <div class="sales-actions">
      <a href="mailto:demo@aestra.it?subject=Richiesta demo AESTRA">Prenota una demo</a>
      <a class="secondary" href="https://app.aestra.it">Prova AESTRA</a>
    </div>`;
  log.appendChild(gate);
  log.scrollTo({ top: log.scrollHeight, behavior: "smooth" });
}

function closeConversation(reason = "") {
  closed = true;
  input.placeholder = "La prima lettura è conclusa. Continua dentro AESTRA.";
  if (reason) addConversationEntry("daphne", reason, "sales");
  renderSuggestions();
  setBusy(false);
  updateProgress();
}

async function sendToDaphne(message) {
  if (Date.now() - lastActivityAt > SESSION_TIMEOUT_MS && conversation.length) {
    resetConversation();
    throw new Error("La sessione era scaduta ed è stata riavviata. Puoi ripetere la domanda.");
  }

  lastActivityAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  const response = await fetch("/api/daphne", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      messages: conversation.slice(-12),
      profile,
      turn: turns,
      maxTurns: MAX_TURNS
    }),
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(payload.error || "Hai raggiunto il limite temporaneo della demo.");
    }
    throw new Error(payload.error || "Non riesco a rispondere in questo momento.");
  }

  return payload;
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (closed) return;

  const value = input.value.trim();
  if (!value) {
    input.focus();
    return;
  }

  turns += 1;
  updateProgress();
  addConversationEntry("user", value);
  conversation.push({ role: "user", content: value });

  input.value = "";
  updateCharacterCounter();
  setBusy(true);

  try {
    const data = await sendToDaphne(value);
    const answer = data.answer || "Non ho abbastanza elementi per rispondere con precisione.";

    addConversationEntry("daphne", answer, data.tone || "");
    conversation.push({ role: "assistant", content: answer });

    if (data.profile && typeof data.profile === "object") {
      profile = { ...profile, ...data.profile };
      updateMemory(true);
    }

    updateDashboard(data);
    renderSuggestions();
    addConversionCard(data.conversion);

    if (data.endConversation || turns >= MAX_TURNS) {
      closeConversation(data.closingMessage || "");
    } else {
      setBusy(false);
      input.focus();
    }
  } catch (error) {
    console.error(error);
    const message = error?.name === "AbortError"
      ? "La risposta sta richiedendo troppo tempo. Riprova tra qualche secondo."
      : (error.message || "Il collegamento non è disponibile.");

    addConversationEntry("daphne", message, "error");
    aiStatus.textContent = "non disponibile";
    aiStatus.className = "error";
    setBusy(false);
  }
});

function resetConversation() {
  conversation = [];
  profile = emptyProfile();
  turns = 0;
  closed = false;
  lastActivityAt = Date.now();

  log.innerHTML = "";
  addConversationEntry("daphne", INITIAL_MESSAGE);

  document.querySelectorAll(".sales-gate[data-ai='true']").forEach((el) => el.remove());

  input.value = "";
  input.disabled = false;
  input.placeholder = "Ad esempio: Ho un centro con 4 cabine...";
  updateCharacterCounter();
  updateProgress();
  updateMemory();
  updateDashboard();
  renderSuggestions();
  setBusy(false);
  input.focus();
}

updateCharacterCounter();
updateProgress();
updateMemory();
updateDashboard();
renderSuggestions();
