
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

const state = {
  messages: [],
  centerName: "",
  cabins: null,
  team: null,
  issue: "",
  software: null
};

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
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

function addConversationEntry(role, text) {
  const entry = document.createElement("div");
  entry.className = `conversation-entry ${role === "user" ? "user-entry" : "daphne-entry"}`;
  entry.innerHTML = `<span>${role === "user" ? "Tu" : "Daphne"}</span><p>${escapeHtml(text)}</p>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
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

  if (lower.includes("primo trattamento") || lower.includes("non tornano") || lower.includes("perdo client")) {
    state.issue = "retention";
  } else if (lower.includes("fatturato") || lower.includes("incasso") || lower.includes("margine")) {
    state.issue = "revenue";
  } else if (lower.includes("agenda") || lower.includes("buchi") || lower.includes("vuota")) {
    state.issue = "agenda";
  } else if (lower.includes("team") || lower.includes("collaboratric") || lower.includes("operatric")) {
    state.issue = "team";
  }

  if (lower.includes("non uso") || lower.includes("senza gestionale") || lower.includes("agenda cartacea")) {
    state.software = false;
  } else if (lower.includes("uso già") || lower.includes("gestionale")) {
    state.software = true;
  }
}

function buildResponse(text) {
  extractContext(text);

  const lower = text.toLowerCase();
  const hasCabins = Number.isFinite(state.cabins);
  const hasTeam = Number.isFinite(state.team);

  let reply;
  let title;
  let copy;
  let opp = 4;
  let cli = 12;
  let spa = 2;
  let imp = "+18%";

  if (state.issue === "retention") {
    reply = hasCabins
      ? `Con ${state.cabins} cabine, il problema non è soltanto quante clienti entrano, ma quante tornano. Analizzerei subito ciò che accade nelle 72 ore dopo il primo trattamento: follow-up, proposta del percorso successivo e tempi di ricontatto.`
      : "Il problema probabilmente non è il primo trattamento, ma ciò che accade nelle 72 ore successive. Analizzerei follow-up, proposta del percorso successivo e tempi di ricontatto.";
    title = "La perdita avviene dopo il primo trattamento.";
    copy = "Daphne suggerisce un percorso automatico di follow-up e ritorno entro 7 giorni.";
    cli = hasTeam ? Math.max(18, state.team * 5) : 27;
    opp = 7;
    imp = "+31%";
  } else if (state.issue === "revenue") {
    reply = hasTeam
      ? `Con un team di ${state.team} persone, non partirei dai prezzi. Confronterei saturazione dell’agenda, valore medio per operatrice e percentuale di clienti che acquistano percorsi. È lì che di solito si nasconde il fatturato non espresso.`
      : "Non partirei dai prezzi. Confronterei saturazione dell’agenda, valore medio per operatrice e percentuale di clienti che acquistano percorsi.";
    title = "Tre leve di crescita senza alzare i prezzi.";
    copy = "Agenda, percorsi e riattivazione sono le aree con impatto più rapido.";
    opp = hasCabins ? Math.min(10, state.cabins + 4) : 8;
    cli = 19;
    spa = hasCabins ? Math.max(2, Math.ceil(state.cabins / 2)) : 3;
    imp = "+26%";
  } else if (state.issue === "agenda") {
    reply = hasCabins
      ? `Con ${state.cabins} cabine, controllerei la saturazione per fascia oraria e non solo la percentuale media giornaliera. Spesso un’agenda sembra piena, ma contiene finestre non vendibili e trattamenti collocati male.`
      : "Controllerei la saturazione per fascia oraria e non solo la percentuale media giornaliera. Spesso un’agenda sembra piena, ma contiene finestre non vendibili.";
    title = "La saturazione non è uniforme.";
    copy = "Vedo margine per distribuire meglio appuntamenti e trattamenti ad alta marginalità.";
    opp = hasCabins ? Math.min(9, state.cabins + 2) : 6;
    spa = hasCabins ? state.cabins : 4;
    imp = "+22%";
  } else if (state.issue === "team") {
    reply = hasTeam
      ? `Con ${state.team} persone, eviterei classifiche semplicistiche. Analizzerei carico, conversione dei percorsi, ritorno clienti e capacità di proposta, distinguendo ciò che dipende dalla persona da ciò che dipende dall’organizzazione.`
      : "Eviterei classifiche semplicistiche. Analizzerei carico, conversione dei percorsi, ritorno clienti e capacità di proposta.";
    title = "Il team va letto, non classificato.";
    copy = "Daphne separa performance individuali e problemi organizzativi.";
    opp = hasTeam ? Math.min(10, state.team + 3) : 5;
    imp = "+20%";
  } else if (hasCabins || hasTeam) {
    const parts = [];
    if (hasCabins) parts.push(`${state.cabins} cabine`);
    if (hasTeam) parts.push(`${state.team} persone`);
    reply = `Con ${parts.join(" e ")}, inizierei da tre verifiche: saturazione reale, ritorno clienti e distribuzione del lavoro. Posso già trasformare questi dati in una prima mappa operativa.`;
    title = "Prima mappa operativa pronta.";
    copy = "La struttura del centro suggerisce opportunità su agenda, retention e distribuzione del lavoro.";
    opp = Math.min(10, (state.cabins || 1) + (state.team || 1));
    spa = state.cabins || 2;
    cli = (state.team || 2) * 4;
    imp = "+21%";
  } else {
    const prior = state.messages.length;
    if (prior === 0) {
      reply = "Per iniziare bene mi servono due informazioni: quante cabine avete e quante persone lavorano nel centro?";
    } else if (!hasCabins) {
      reply = "Ho capito il problema. Per stimarne l’impatto, dimmi quante cabine avete.";
    } else if (!hasTeam) {
      reply = "Perfetto. Ora dimmi quante persone lavorano nel centro, compresa la titolare.";
    } else {
      reply = "Ho abbastanza elementi per una prima analisi. Posso concentrarmi su agenda, clienti inattivi, fatturato o team: da quale area vuoi partire?";
    }
    title = "Sto costruendo il profilo del centro.";
    copy = "Ogni dettaglio aggiunge precisione alla lettura di Daphne.";
  }

  state.messages.push({ role: "user", text }, { role: "daphne", text: reply });

  return { reply, title, copy, opp, cli, spa, imp };
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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  addConversationEntry("user", value);
  input.value = "";
  submitButton.disabled = true;
  submitButton.innerHTML = "Daphne sta pensando…";

  setTimeout(() => {
    const result = buildResponse(value);
    addConversationEntry("daphne", result.reply);
    updateDashboard(result);
    submitButton.disabled = false;
    submitButton.innerHTML = 'Invia a Daphne <span>→</span>';
    input.focus();
  }, 650);
});
