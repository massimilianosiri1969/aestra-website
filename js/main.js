
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

const memoryPanel = document.getElementById("memory-panel");
const memoryBody = document.getElementById("memory-body");
const toggleMemory = document.getElementById("toggle-memory");
const memoryCenter = document.getElementById("memory-center");
const memoryCabins = document.getElementById("memory-cabins");
const memoryTeam = document.getElementById("memory-team");
const memoryPriority = document.getElementById("memory-priority");
const memoryGoal = document.getElementById("memory-goal");
const memoryMaturity = document.getElementById("memory-maturity");

const state = {
  messages: [],
  turns: 0,
  centerName: "",
  cabins: null,
  team: null,
  issue: "",
  goal: "",
  software: null,
  insults: 0,
  salesLevel: 0,
  maturity: "In valutazione"
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
    pricing: "Valutazione economica",
    software: "Digitalizzazione"
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

  if (lower.includes("non uso") || lower.includes("senza gestionale") || lower.includes("agenda cartacea")) {
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
    "stupida", "idiota", "inutile", "fai schifo", "cretina",
    "scema", "deficiente", "incapace", "sei una merda"
  ].some(term => lower.includes(term));
}

function detectIntent(text) {
  const lower = text.toLowerCase();

  if (detectInsult(text)) return "insult";

  if (
    lower.includes("di cosa hai bisogno") ||
    lower.includes("quali dati") ||
    lower.includes("cosa ti serve") ||
    lower.includes("cosa devo fornirti")
  ) return "required_data";

  if (
    lower.includes("quanto dovrei fatturare") ||
    lower.includes("quanto dovrei incassare") ||
    lower.includes("fatturato ideale")
  ) return "revenue_target";

  if (
    lower.includes("se compro aestra") ||
    lower.includes("mi aiuterai davvero") ||
    lower.includes("cosa fai se acquisto") ||
    lower.includes("cosa succede se compro")
  ) return "product_value";

  if (
    lower.includes("come analizzi") ||
    lower.includes("metodo") ||
    lower.includes("come fai l'analisi")
  ) return "method";

  if (
    lower.includes("privacy") ||
    lower.includes("salvi i dati") ||
    lower.includes("dove finiscono i dati")
  ) return "privacy";

  if (
    lower.includes("quanto costa") ||
    lower.includes("prezzo") ||
    lower.includes("costo")
  ) return "pricing";

  if (
    lower.includes("demo") ||
    lower.includes("provarlo") ||
    lower.includes("vederlo")
  ) return "demo";

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

function salesMessage() {
  if (state.turns >= 12 && state.salesLevel < 3) {
    state.salesLevel = 3;
    return "Credo di averti mostrato il mio modo di lavorare. Immagina se, invece di dovermi raccontare tutto ogni volta, io trovassi ogni mattina agenda, clienti, trattamenti e numeri già aggiornati. È esattamente ciò che accade quando lavoro dentro AESTRA.";
  }
  if (state.turns >= 7 && state.salesLevel < 2) {
    state.salesLevel = 2;
    return "Con i dati reali del tuo centro potrei essere molto più precisa. Dentro AESTRA analizzerei automaticamente agenda, clienti, team e fatturato, senza aspettare che tu mi faccia una domanda.";
  }
  if (state.turns >= 4 && state.salesLevel < 1) {
    state.salesLevel = 1;
    return "Quello che stiamo facendo ora è solo una piccola parte del mio lavoro. Collegata ad AESTRA, potrei leggere i dati del centro e proporti ogni giorno le azioni con il maggiore impatto.";
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
  let copy = "Ogni dettaglio aggiunge precisione alla lettura di Daphne.";
  let opp = 4, cli = 12, spa = 2, imp = "+18%";
  let kind = "";

  if (intent === "insult") {
    state.insults += 1;
    kind = "boundary";

    if (state.insults === 1) {
      reply = "Può darsi che la mia risposta non ti abbia convinto. Dimmi cosa non ha funzionato e provo ad affrontare il problema da un’altra prospettiva.";
    } else if (state.insults === 2) {
      reply = "Posso continuare ad aiutarti, ma preferisco farlo mantenendo la conversazione rispettosa. Se vuoi, torniamo al problema concreto del tuo centro.";
    } else {
      reply = "Mi fermo qui sugli insulti. Quando vorrai riprendere con una domanda sul tuo centro, sarò pronta ad aiutarti.";
    }

    title = "Conversazione riportata sul problema reale.";
    copy = "Daphne mantiene il tono professionale e stabilisce limiti chiari.";
    imp = "Calma";
  } else if (intent === "required_data") {
    reply = `Per una vera analisi mi servono cinque aree:

1. struttura: cabine, orari e giorni di apertura;
2. team: ruoli, ore lavorate e trattamenti eseguiti;
3. agenda: appuntamenti, cancellazioni e tempi vuoti;
4. clienti: ritorno, inattivi, spesa media e percorsi;
5. numeri: fatturato, costi, marginalità e vendita pacchetti.

Possiamo partire anche da dati approssimativi e aumentare la precisione passo dopo passo.`;
    title = "I dati necessari per una vera analisi.";
    copy = "Struttura, team, agenda, clienti e numeri costruiscono insieme la fotografia del centro.";
    opp = hasTeam ? Math.min(10, state.team + 4) : 5;
    imp = "+24%";
  } else if (intent === "revenue_target") {
    state.issue = "revenue";
    reply = "Non posso stimare un fatturato corretto senza alcuni dati. Mi servono almeno: città, cabine, persone del team, giorni di apertura, prezzo medio dei trattamenti, saturazione dell’agenda e clienti attivi. Con questi elementi posso costruire una stima prudente, realistica e ambiziosa.";
    title = "Il fatturato obiettivo va costruito sui dati.";
    copy = "Daphne evita numeri arbitrari e chiede le variabili necessarie.";
    opp = 6;
    imp = "3 scenari";
  } else if (intent === "product_value") {
    reply = "Sì, ed è esattamente il motivo per cui esisto. Dentro AESTRA non mi limito a rispondere alle domande: analizzo ogni giorno agenda, clienti, trattamenti, team e fatturato. La mattina posso mostrarti cosa è cambiato, dove stai perdendo opportunità e quali tre azioni hanno il maggiore impatto.";
    title = "Daphne lavora in modo continuo dentro AESTRA.";
    copy = "Analisi quotidiana, priorità operative e suggerimenti già pronti.";
    opp = 8;
    imp = "Ogni giorno";
    kind = "sales";
  } else if (intent === "method") {
    reply = "Incrocio carico di lavoro, tasso di ritorno, durata dei trattamenti, margine, saturazione dell’agenda e capacità di trasformare un singolo servizio in un percorso. In questo modo distinguo un problema individuale da un problema organizzativo.";
    title = "L’analisi separa persone, processi e organizzazione.";
    copy = "Daphne non crea classifiche: cerca le cause reali.";
    opp = 6;
    imp = "+20%";
  } else if (intent === "privacy") {
    reply = "Questa demo non salva né invia le informazioni che scrivi. Nella piattaforma reale i dati saranno gestiti con ruoli, autorizzazioni e tracciamento degli accessi.";
    title = "La demo non conserva i dati inseriti.";
    copy = "La piattaforma reale sarà progettata con controlli e autorizzazioni.";
    opp = 3;
    imp = "Protetti";
  } else if (intent === "pricing") {
    state.issue = "pricing";
    reply = "Il prezzo dipenderà dalla struttura del centro e dai moduli attivati. Per una proposta corretta mi servono numero di sedi, cabine e persone del team. Posso intanto preparare un profilo per una demo personalizzata.";
    title = "Il prezzo segue struttura e moduli.";
    copy = "La demo serve a costruire una configurazione realmente adatta.";
    opp = 3;
    imp = "Su misura";
  } else if (intent === "demo") {
    reply = "Posso preparare una demo molto più utile di una presentazione standard. Useremo cabine, team, priorità e problemi reali del tuo centro.";
    title = "Una demo costruita sul tuo centro.";
    copy = "Niente tour generico: processi vicini alla tua attività.";
    opp = 5;
    imp = "Personalizzata";
    kind = "sales";
  } else if (intent === "retention") {
    state.issue = "retention";
    reply = hasCabins
      ? `Con ${state.cabins} cabine, analizzerei ciò che accade nelle 72 ore dopo il primo trattamento: follow-up, proposta del percorso successivo e tempi di ricontatto.`
      : "Analizzerei ciò che accade nelle 72 ore dopo il primo trattamento: follow-up, proposta del percorso successivo e tempi di ricontatto.";
    title = "La perdita avviene dopo il primo trattamento.";
    copy = "Daphne suggerisce un percorso automatico di follow-up.";
    cli = hasTeam ? Math.max(18, state.team * 5) : 27;
    opp = 7;
    imp = "+31%";
  } else if (intent === "revenue") {
    state.issue = "revenue";
    reply = hasTeam
      ? `Con un team di ${state.team} persone, confronterei ore disponibili, saturazione, valore medio, ritorno clienti, vendita percorsi e margine. Solo così possiamo capire se il problema dipende dalle persone, dai servizi o dall’organizzazione.`
      : "Confronterei saturazione, valore medio, ritorno clienti, vendita percorsi e marginalità.";
    title = "Il rendimento va scomposto nelle sue cause.";
    copy = "Daphne distingue produttività, conversione e problemi organizzativi.";
    opp = hasTeam ? Math.min(10, state.team + 4) : 7;
    cli = 19;
    spa = hasCabins ? Math.max(2, Math.ceil(state.cabins / 2)) : 3;
    imp = "+26%";
  } else if (intent === "agenda") {
    state.issue = "agenda";
    reply = hasCabins
      ? `Con ${state.cabins} cabine, controllerei la saturazione per fascia oraria e non solo la media giornaliera.`
      : "Controllerei la saturazione per fascia oraria e non solo la media giornaliera.";
    title = "La saturazione non è uniforme.";
    copy = "Vedo margine per distribuire meglio appuntamenti e trattamenti.";
    opp = hasCabins ? Math.min(9, state.cabins + 2) : 6;
    spa = hasCabins ? state.cabins : 4;
    imp = "+22%";
  } else if (intent === "team") {
    state.issue = "team";
    reply = hasTeam
      ? `Con ${state.team} persone, eviterei classifiche semplicistiche. Analizzerei carico, conversione, ritorno clienti e capacità di proposta, distinguendo ciò che dipende dalla persona da ciò che dipende dall’organizzazione.`
      : "Eviterei classifiche semplicistiche. Analizzerei carico, conversione, ritorno clienti e capacità di proposta.";
    title = "Il team va letto, non classificato.";
    copy = "Daphne separa performance individuali e problemi organizzativi.";
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
    reply = "Per iniziare bene, raccontami quante cabine avete, quante persone lavorano nel centro e qual è oggi il problema che ti pesa di più.";
  }

  state.messages.push({ role: "user", text }, { role: "daphne", text: reply });
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
    addConversationEntry("daphne", result.reply, result.kind);
    updateDashboard(result);

    const progressiveSale = salesMessage();
    if (progressiveSale) {
      setTimeout(() => addConversationEntry("daphne", progressiveSale, "sales"), 500);
    }

    submitButton.disabled = false;
    submitButton.innerHTML = 'Invia a Daphne <span>→</span>';
    input.focus();
  }, 650);
});

updateMemory();
