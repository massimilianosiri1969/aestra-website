
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

function detectIntent(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("di cosa hai bisogno") ||
    lower.includes("quali dati") ||
    lower.includes("cosa ti serve") ||
    lower.includes("cosa devo fornirti") ||
    lower.includes("informazioni ti servono")
  ) return "required_data";

  if (
    lower.includes("come analizzi") ||
    lower.includes("come fai l'analisi") ||
    lower.includes("metodo") ||
    lower.includes("in che modo analizzi")
  ) return "method";

  if (
    lower.includes("privacy") ||
    lower.includes("dati sicuri") ||
    lower.includes("salvi i dati") ||
    lower.includes("dove finiscono i dati")
  ) return "privacy";

  if (
    lower.includes("quanto tempo") ||
    lower.includes("quanto ci vuole") ||
    lower.includes("tempi dell'analisi")
  ) return "timing";

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

function buildResponse(text) {
  extractContext(text);

  const intent = detectIntent(text);
  const hasCabins = Number.isFinite(state.cabins);
  const hasTeam = Number.isFinite(state.team);

  let reply;
  let title;
  let copy;
  let opp = 4;
  let cli = 12;
  let spa = 2;
  let imp = "+18%";

  if (intent === "required_data") {
    const known = [];
    if (hasCabins) known.push(`${state.cabins} cabine`);
    if (hasTeam) known.push(`${state.team} persone nel team`);

    reply = `Per fare un’analisi dettagliata mi servono cinque gruppi di informazioni:

1. struttura del centro: cabine, orari e giorni di apertura;
2. team: persone, ruoli, ore lavorate e trattamenti eseguiti;
3. agenda: appuntamenti, cancellazioni, tempi vuoti e saturazione;
4. clienti: frequenza di ritorno, inattivi, spesa media e trattamenti acquistati;
5. numeri: fatturato, costi principali, marginalità e vendita di pacchetti.

${known.length ? `So già che hai ${known.join(" e ")}. Il passo successivo sarebbe capire quante cabine avete e come si distribuisce l’agenda durante la settimana.` : "Possiamo partire anche da dati approssimativi: Daphne renderà l’analisi più precisa man mano che aggiungi informazioni."}`;

    title = "Ecco i dati necessari per una vera analisi.";
    copy = "Struttura, team, agenda, clienti e numeri costruiscono insieme la fotografia del centro.";
    opp = hasTeam ? Math.min(10, state.team + 4) : 5;
    imp = "+24%";
  } else if (intent === "method") {
    reply = "Non confronto soltanto chi vende di più. Incrocio carico di lavoro, tasso di ritorno dei clienti, durata dei trattamenti, margine, riempimento dell’agenda e capacità di trasformare un singolo servizio in un percorso. In questo modo distinguo un problema individuale da un problema organizzativo.";
    title = "L’analisi separa persone, processi e organizzazione.";
    copy = "Daphne non crea classifiche: cerca le cause reali dietro i risultati.";
    opp = 6;
    imp = "+20%";
  } else if (intent === "privacy") {
    reply = "Nella versione definitiva i dati saranno trattati all’interno dell’infrastruttura AESTRA, con accessi autorizzati e regole di conservazione definite. Questa demo non salva né invia le informazioni che scrivi: serve soltanto a mostrare il funzionamento dell’esperienza.";
    title = "La demo non conserva i dati inseriti.";
    copy = "La piattaforma reale sarà progettata con ruoli, autorizzazioni e tracciamento degli accessi.";
    opp = 3;
    imp = "Protetti";
  } else if (intent === "timing") {
    reply = hasCabins || hasTeam
      ? "Una prima lettura può richiedere pochi minuti. Un’analisi affidabile del centro, con agenda, clienti e numeri reali, migliora progressivamente nei primi giorni di utilizzo."
      : "Una prima lettura richiede pochi minuti. Per un’analisi completa servono invece i dati di agenda, clienti, team e fatturato.";
    title = "Prime indicazioni subito, precisione crescente nel tempo.";
    copy = "Daphne impara dal funzionamento reale del centro.";
    opp = 4;
    imp = "24/7";
  } else if (intent === "pricing") {
    reply = "Il prezzo dovrà dipendere dalla configurazione del centro e dai moduli attivati. Per una proposta corretta mi servirebbero almeno numero di sedi, cabine e persone del team. Posso intanto preparare il profilo per una demo personalizzata.";
    title = "Il prezzo segue la struttura e i moduli del centro.";
    copy = "La demo serve a costruire una configurazione realmente adatta.";
    opp = 3;
    imp = "Su misura";
  } else if (intent === "demo") {
    reply = "Posso preparare una demo molto più utile di una presentazione standard. Useremo numero di cabine, team, priorità e principali problemi del tuo centro, così vedrai AESTRA lavorare su uno scenario vicino alla tua realtà.";
    title = "Una demo costruita sul tuo centro.";
    copy = "Niente tour generico: dati e processi vicini alla tua attività.";
    opp = 5;
    imp = "Personalizzata";
  } else if (intent === "retention") {
    reply = hasCabins
      ? `Con ${state.cabins} cabine, il problema non è soltanto quante clienti entrano, ma quante tornano. Analizzerei ciò che accade nelle 72 ore dopo il primo trattamento: follow-up, proposta del percorso successivo e tempi di ricontatto.`
      : "Il problema probabilmente non è il primo trattamento, ma ciò che accade nelle 72 ore successive. Analizzerei follow-up, proposta del percorso successivo e tempi di ricontatto.";
    title = "La perdita avviene dopo il primo trattamento.";
    copy = "Daphne suggerisce un percorso automatico di follow-up e ritorno entro 7 giorni.";
    cli = hasTeam ? Math.max(18, state.team * 5) : 27;
    opp = 7;
    imp = "+31%";
  } else if (intent === "revenue") {
    reply = hasTeam
      ? `Con un team di ${state.team} persone, non partirei da una classifica. Confronterei ore disponibili, saturazione, valore medio per operatrice, ritorno delle clienti, vendita dei percorsi e margine dei trattamenti. Solo così possiamo capire se il problema dipende dalle persone, dal mix dei servizi o dall’organizzazione dell’agenda.`
      : "Per capire perché il team rende meno del previsto confronterei saturazione, valore medio, ritorno clienti, vendita dei percorsi e marginalità.";
    title = "Il rendimento va scomposto nelle sue cause.";
    copy = "Daphne distingue produttività, conversione, retention e problemi organizzativi.";
    opp = hasTeam ? Math.min(10, state.team + 4) : 7;
    cli = 19;
    spa = hasCabins ? Math.max(2, Math.ceil(state.cabins / 2)) : 3;
    imp = "+26%";
  } else if (intent === "agenda") {
    reply = hasCabins
      ? `Con ${state.cabins} cabine, controllerei la saturazione per fascia oraria e non solo la media giornaliera. Un’agenda può sembrare piena e contenere comunque finestre non vendibili o trattamenti collocati male.`
      : "Controllerei la saturazione per fascia oraria e non solo la media giornaliera. Un’agenda può sembrare piena e contenere comunque finestre non vendibili.";
    title = "La saturazione non è uniforme.";
    copy = "Vedo margine per distribuire meglio appuntamenti e trattamenti ad alta marginalità.";
    opp = hasCabins ? Math.min(9, state.cabins + 2) : 6;
    spa = hasCabins ? state.cabins : 4;
    imp = "+22%";
  } else if (intent === "team") {
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

    reply = `So già che il centro ha ${parts.join(" e ")}. Per proseguire posso concentrarmi su una di queste aree: agenda, ritorno clienti, fatturato oppure performance del team. Qual è oggi il problema più urgente?`;
    title = "Il profilo iniziale è pronto.";
    copy = "Ora serve scegliere la priorità operativa da approfondire.";
    opp = Math.min(10, (state.cabins || 1) + (state.team || 1));
    spa = state.cabins || 2;
    cli = (state.team || 2) * 4;
    imp = "+21%";
  } else {
    reply = "Per iniziare bene, raccontami quante cabine avete, quante persone lavorano nel centro e qual è oggi il problema che ti pesa di più.";
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
