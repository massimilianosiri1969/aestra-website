
const form = document.getElementById("prompt-form");
const input = document.getElementById("prompt-input");
const log = document.getElementById("conversation-log");
const buttons = document.querySelectorAll("[data-prompt]");
const submitButton = form?.querySelector("button[type='submit']");

const insightTitle = document.getElementById("insight-title");
const insightCopy = document.getElementById("insight-copy");
const opportunities = document.getElementById("opportunities");
const clients = document.getElementById("clients");
const spaces = document.getElementById("spaces");
const impact = document.getElementById("impact");
const centerLabel = document.getElementById("center-label");

const memoryBody = document.getElementById("memory-body");
const toggleMemory = document.getElementById("toggle-memory");
const memoryCenter = document.getElementById("memory-center");
const memoryCabins = document.getElementById("memory-cabins");
const memoryTeam = document.getElementById("memory-team");
const memoryPriority = document.getElementById("memory-priority");
const memoryGoal = document.getElementById("memory-goal");
const memoryMaturity = document.getElementById("memory-maturity");

const MAX_TURNS = 10;

const state = {
  turns: 0,
  centerName: "",
  cabins: null,
  team: null,
  issue: "",
  goal: "",
  software: null,
  insults: 0,
  maturity: "In valutazione",
  closed: false
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

toggleMemory?.addEventListener("click", () => {
  memoryBody.classList.toggle("open");
  toggleMemory.textContent = memoryBody.classList.contains("open") ? "Nascondi" : "Mostra";
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function addConversationEntry(role, text, kind = "") {
  const entry = document.createElement("div");
  let className = role === "user" ? "user-entry" : "daphne-entry";
  if (kind === "sales") className += " sales-entry";
  if (kind === "boundary") className += " boundary-entry";
  entry.className = `conversation-entry ${className}`;
  entry.innerHTML = `<span>${role === "user" ? "Tu" : "Daphne"}</span><p>${escapeHtml(text)}</p>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function addSalesGate(message) {
  const gate = document.createElement("div");
  gate.className = "sales-gate";
  gate.innerHTML = `
    <strong>${escapeHtml(message)}</strong>
    <span>Sul sito posso offrirti solo una prima lettura. Dentro AESTRA lavoro ogni giorno su agenda, clienti, team e numeri reali.</span>
    <div class="sales-actions">
      <a href="mailto:demo@aestra.it?subject=Richiesta demo AESTRA">Prenota una demo</a>
      <a class="secondary" href="https://app.aestra.it">Prova AESTRA</a>
    </div>
  `;
  log.appendChild(gate);
  log.scrollTop = log.scrollHeight;
}

function addLimitNote() {
  if (document.querySelector(".chat-limit")) return;
  const note = document.createElement("div");
  note.className = "chat-limit";
  note.textContent = "La versione pubblica di Daphne offre una prima lettura. La consulenza completa è disponibile dentro AESTRA.";
  document.getElementById("response-panel").appendChild(note);
}

function updateMemory() {
  memoryCenter.textContent = state.centerName || "Non ancora indicato";
  memoryCabins.textContent = Number.isFinite(state.cabins) ? state.cabins : "—";
  memoryTeam.textContent = Number.isFinite(state.team) ? state.team : "—";
  memoryPriority.textContent = state.issue ? labelIssue(state.issue) : "Da definire";
  memoryGoal.textContent = state.goal || "Da definire";
  memoryMaturity.textContent = state.maturity;
}

function labelIssue(issue) {
  return {
    retention: "Ritorno clienti",
    revenue: "Fatturato e marginalità",
    agenda: "Saturazione agenda",
    team: "Performance del team",
    digitalization: "Digitalizzazione"
  }[issue] || "Da definire";
}

function extractContext(text) {
  const lower = text.toLowerCase();

  const cabinMatch = lower.match(/(\d+)\s*cabine?/);
  if (cabinMatch) state.cabins = Number(cabinMatch[1]);

  const teamMatch = lower.match(/(\d+)\s*(collaboratrici|collaboratori|persone|dipendenti|operatrici|operatori)/);
  if (teamMatch) state.team = Number(teamMatch[1]);

  const centerMatch = text.match(/(?:centro|salone|istituto)\s+(?:si chiama\s+)?["“]?([A-ZÀ-Ý][\wÀ-ÿ' -]{2,35})/i);
  if (centerMatch) {
    state.centerName = centerMatch[1].trim().replace(/[.,!?].*$/, "");
    centerLabel.textContent = state.centerName;
  }

  if (lower.includes("aumentare il fatturato") || lower.includes("guadagnare di più")) {
    state.goal = "Aumentare il fatturato";
  } else if (lower.includes("più clienti") || lower.includes("nuovi clienti")) {
    state.goal = "Acquisire più clienti";
  } else if (lower.includes("organizzare meglio") || lower.includes("meno caos")) {
    state.goal = "Migliorare l'organizzazione";
  } else if (lower.includes("far rendere il team") || lower.includes("produttività")) {
    state.goal = "Migliorare la produttività del team";
  }

  if (lower.includes("agenda cartacea") || lower.includes("senza gestionale") || lower.includes("non uso un gestionale")) {
    state.software = false;
    state.maturity = "Iniziale";
  } else if (lower.includes("uso già") || lower.includes("gestionale")) {
    state.software = true;
    state.maturity = "Intermedia";
  }

  if (Number.isFinite(state.cabins) && Number.isFinite(state.team) && state.issue && state.goal) {
    state.maturity = "Strutturata";
  }

  updateMemory();
}

function detectInsult(text) {
  const lower = text.toLowerCase();
  return [
    "stupida", "idiota", "inutile", "fai schifo",
    "cretina", "scema", "deficiente", "incapace"
  ].some(term => lower.includes(term));
}

function detectIntent(text) {
  const lower = text.toLowerCase();

  if (detectInsult(text)) return "insult";

  if (
    lower.includes("come posso collegarti") ||
    lower.includes("come faccio ad averti") ||
    lower.includes("come lavorare con te") ||
    lower.includes("se compro aestra") ||
    lower.includes("come acquistare")
  ) return "conversion";

  if (
    lower.includes("quanto dovrei fatturare") ||
    lower.includes("fatturato ideale") ||
    lower.includes("quanto dovrei incassare")
  ) return "revenue_target";

  if (
    lower.includes("di cosa hai bisogno") ||
    lower.includes("quali dati") ||
    lower.includes("cosa ti serve")
  ) return "required_data";

  if (
    lower.includes("primo trattamento") ||
    lower.includes("non tornano") ||
    lower.includes("perdo client")
  ) return "retention";

  if (
    lower.includes("fatturato") ||
    lower.includes("incasso") ||
    lower.includes("margine") ||
    lower.includes("rendono quanto")
  ) return "revenue";

  if (
    lower.includes("agenda") ||
    lower.includes("buchi") ||
    lower.includes("vuota") ||
    lower.includes("appuntamenti")
  ) return "agenda";

  if (
    lower.includes("team") ||
    lower.includes("collaboratric") ||
    lower.includes("operatric") ||
    lower.includes("dipendenti")
  ) return "team";

  return "general";
}

function progressiveSalesMessage() {
  if (state.turns === 4) {
    return "Quello che stiamo facendo qui è solo una prima lettura. Dentro AESTRA potrei analizzare automaticamente i dati del centro senza aspettare che tu me li racconti.";
  }
  if (state.turns === 7) {
    return "A questo punto ho già una prima idea del tuo centro. Collegata ad AESTRA potrei trasformarla in priorità quotidiane, azioni e monitoraggio dei risultati.";
  }
  return "";
}

function buildResponse(text) {
  extractContext(text);
  state.turns += 1;

  const intent = detectIntent(text);
  const hasCabins = Number.isFinite(state.cabins);
  const hasTeam = Number.isFinite(state.team);

  let reply = "";
  let title = "Sto costruendo il profilo del centro.";
  let copy = "Ogni dettaglio aggiunge precisione alla prima lettura.";
  let opp = 4, cli = 12, spa = 2, imp = "+18%";
  let kind = "";

  if (intent === "insult") {
    state.insults += 1;
    kind = "boundary";
    if (state.insults === 1) {
      reply = "Capisco che la risposta possa non averti convinto. Dimmi cosa non ha funzionato e provo a essere più utile.";
    } else if (state.insults === 2) {
      reply = "Posso continuare ad aiutarti, ma preferisco farlo mantenendo la conversazione rispettosa. Torniamo pure al problema del tuo centro.";
    } else {
      reply = "Mi fermo qui sugli insulti. Quando vorrai riprendere con una domanda concreta, sarò pronta.";
    }
    title = "Conversazione riportata sul problema reale.";
    copy = "Daphne mantiene il tono professionale e pone limiti chiari.";
    imp = "Calma";
  } else if (intent === "conversion") {
    reply = "Per lavorare con me ogni giorno devi attivare AESTRA per il tuo centro. Durante la configurazione collegheremo agenda, clienti, team e servizi. Da quel momento non dovrai più raccontarmi cosa succede: potrò leggerlo direttamente e prepararti priorità e suggerimenti quotidiani.";
    title = "Daphne lavora davvero dentro AESTRA.";
    copy = "Attivazione, configurazione del centro e analisi quotidiana.";
    opp = 8;
    imp = "Ogni giorno";
    kind = "sales";
  } else if (intent === "required_data") {
    reply = "Per una prima lettura mi bastano struttura, team, problema principale e obiettivo. L’analisi completa richiede invece agenda, clienti, trattamenti e numeri reali: è proprio il valore che Daphne offre dentro AESTRA.";
    title = "Prima lettura sul sito, analisi completa dentro AESTRA.";
    copy = "La versione pubblica mostra il metodo senza sostituire il software.";
    opp = 5;
    imp = "Assaggio";
  } else if (intent === "revenue_target") {
    state.issue = "revenue";
    reply = "Posso aiutarti a capire da quali variabili dipende, ma non sarebbe serio darti qui un numero definitivo. Dentro AESTRA potrei costruire un obiettivo dinamico usando cabine, team, agenda, prezzi, clienti attivi e marginalità reale.";
    title = "Il fatturato obiettivo richiede dati reali.";
    copy = "Daphne può costruirlo e aggiornarlo automaticamente dentro AESTRA.";
    opp = 6;
    imp = "3 scenari";
  } else if (intent === "retention") {
    state.issue = "retention";
    reply = "Il primo punto che controllerei è ciò che accade nelle 72 ore dopo il trattamento: follow-up, proposta del percorso successivo e tempi di ricontatto. Posso mostrarti il metodo; dentro AESTRA potrei individuare automaticamente le clienti a rischio.";
    title = "Il problema è spesso dopo il primo trattamento.";
    copy = "Dentro AESTRA Daphne individua e segue le clienti a rischio.";
    cli = hasTeam ? Math.max(18, state.team * 5) : 27;
    opp = 7;
    imp = "+31%";
  } else if (intent === "revenue") {
    state.issue = "revenue";
    reply = hasTeam
      ? `Con ${state.team} persone, guarderei saturazione, valore medio, ritorno clienti e vendita dei percorsi. Qui posso indicarti le leve; dentro AESTRA potrei misurarle continuamente sui dati reali.`
      : "Guarderei saturazione, valore medio, ritorno clienti e vendita dei percorsi. Qui posso indicarti le leve; dentro AESTRA potrei misurarle continuamente.";
    title = "Il rendimento va scomposto nelle sue cause.";
    copy = "Daphne misura produttività, conversione e marginalità dentro AESTRA.";
    opp = hasTeam ? Math.min(10, state.team + 4) : 7;
    cli = 19;
    spa = hasCabins ? Math.max(2, Math.ceil(state.cabins / 2)) : 3;
    imp = "+26%";
  } else if (intent === "agenda") {
    state.issue = "agenda";
    reply = hasCabins
      ? `Con ${state.cabins} cabine, controllerei la saturazione per fascia oraria. Qui posso darti una prima direzione; dentro AESTRA potrei individuare automaticamente buchi e opportunità.`
      : "Controllerei la saturazione per fascia oraria. Qui posso darti una prima direzione; dentro AESTRA potrei individuare automaticamente buchi e opportunità.";
    title = "La saturazione non è uniforme.";
    copy = "Dentro AESTRA Daphne analizza l’agenda in modo continuo.";
    opp = hasCabins ? Math.min(9, state.cabins + 2) : 6;
    spa = hasCabins ? state.cabins : 4;
    imp = "+22%";
  } else if (intent === "team") {
    state.issue = "team";
    reply = hasTeam
      ? `Con ${state.team} persone, eviterei classifiche semplicistiche. Guarderei carico, ritorno clienti e capacità di proposta. Qui posso mostrarti il criterio; dentro AESTRA potrei analizzare il team sui dati reali.`
      : "Eviterei classifiche semplicistiche. Guarderei carico, ritorno clienti e capacità di proposta.";
    title = "Il team va letto, non classificato.";
    copy = "Dentro AESTRA Daphne separa performance e problemi organizzativi.";
    opp = hasTeam ? Math.min(10, state.team + 3) : 5;
    imp = "+20%";
  } else if (hasCabins || hasTeam) {
    const known = [];
    if (hasCabins) known.push(`${state.cabins} cabine`);
    if (hasTeam) known.push(`${state.team} persone`);
    reply = `So già che il centro ha ${known.join(" e ")}. Ora dimmi qual è il problema più urgente: agenda, clienti inattivi, fatturato oppure team.`;
    title = "Il profilo iniziale è pronto.";
    copy = "Ora serve scegliere la priorità operativa.";
    opp = Math.min(10, (state.cabins || 1) + (state.team || 1));
    spa = state.cabins || 2;
    cli = (state.team || 2) * 4;
    imp = "+21%";
  } else {
    reply = "Per iniziare, raccontami quante cabine avete, quante persone lavorano nel centro e qual è oggi il problema che ti pesa di più.";
  }

  updateMemory();
  return { reply, title, copy, opp, cli, spa, imp, kind };
}

function updateDashboard(result) {
  insightTitle.textContent = result.title;
  insightCopy.textContent = result.copy;
  opportunities.textContent = result.opp;
  clients.textContent = result.cli;
  spaces.textContent = result.spa;
  impact.textContent = result.imp;

  document.querySelectorAll(".chart div").forEach((bar, index) => {
    const heights = [38, 49, 44, 61, 70, 82, 94];
    bar.style.height = `${heights[index] + Math.floor(Math.random() * 7)}%`;
  });
}

function closePublicConversation() {
  state.closed = true;
  input.disabled = true;
  submitButton.disabled = true;
  input.placeholder = "Continua la conversazione dentro AESTRA";
  addSalesGate("Ora ho abbastanza elementi per indicarti il passo successivo.");
  addLimitNote();
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state.closed) return;

  const value = input.value.trim();
  if (!value) return;

  addConversationEntry("user", value);
  input.value = "";
  submitButton.disabled = true;
  submitButton.innerHTML = "Daphne sta pensando…";

  setTimeout(() => {
    const result = buildResponse(value);
    addConversationEntry("daphne", result.reply, result.kind);
    updateDashboard(result);

    const salesMessage = progressiveSalesMessage();
    if (salesMessage) {
      setTimeout(() => addConversationEntry("daphne", salesMessage, "sales"), 450);
    }

    if (state.turns >= MAX_TURNS || result.kind === "sales" && state.turns >= 6) {
      setTimeout(closePublicConversation, 750);
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Invia a Daphne <span>→</span>';
      input.focus();
    }
  }, 650);
});

updateMemory();
