const menu=document.getElementById('menu'),nav=document.getElementById('main-nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
/* Guided interactive Daphne prototype */
(() => {
  const form = document.getElementById("chat-form");
  if (!form) return;

  const input = document.getElementById("chat-text");
  const body = document.getElementById("chat-body");
  const replies = document.getElementById("quick-replies");
  const centerName = document.getElementById("center-name");
  const cabins = document.getElementById("kpi-cabins");
  const team = document.getElementById("kpi-team");
  const software = document.getElementById("kpi-software");
  const opportunities = document.getElementById("kpi-opportunities");
  const insight = document.getElementById("dashboard-insight");

  const state = { step: 0, center: "", cabins: "", team: "", software: "" };

  const addMessage = (text, who = "daphne") => {
    const item = document.createElement("div");
    item.className = `message ${who === "user" ? "user-message" : "daphne-message"}`;
    item.innerHTML = `<p>${text}</p>`;
    body.appendChild(item);
    body.scrollTop = body.scrollHeight;
  };

  const setReplies = (items = []) => {
    replies.innerHTML = "";
    items.forEach(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => handleAnswer(label));
      replies.appendChild(button);
    });
  };

  const updateDashboard = () => {
    centerName.textContent = state.center || "Il tuo centro";
    cabins.textContent = state.cabins || "—";
    team.textContent = state.team || "—";
    software.textContent = state.software || "—";

    const c = parseInt(state.cabins) || 1;
    const t = parseInt(state.team) || 1;
    const score = Math.max(3, Math.min(12, c + t + (state.software === "No" ? 3 : 1)));
    opportunities.textContent = score;

    if (state.step >= 4) {
      insight.textContent = `${state.center}: vedo margine per recuperare clienti inattivi, riempire gli spazi liberi e ridurre le attività manuali del team.`;
    }
  };

  const askNext = () => {
    if (state.step === 1) {
      addMessage(`Piacere di conoscerti. Quante cabine ha ${state.center}?`);
      setReplies(["1", "2", "3", "4", "5+"]);
    } else if (state.step === 2) {
      addMessage("Quante persone lavorano nel centro, compresa la titolare?");
      setReplies(["1", "2", "3", "4", "5", "6+"]);
    } else if (state.step === 3) {
      addMessage("Utilizzate già un gestionale?");
      setReplies(["Sì", "No"]);
    } else if (state.step === 4) {
      addMessage(`Ho una prima lettura di ${state.center}. Vedo almeno ${opportunities.textContent} opportunità operative. Da dove vuoi iniziare?`);
      setReplies(["Agenda vuota", "Clienti inattivi", "Fatturato", "Team"]);
    }
  };

  const finalResponse = answer => {
    const responses = {
      "Agenda vuota": `Con ${state.cabins} cabine e ${state.team} persone, inizierei dagli spazi liberi ricorrenti. AESTRA può trovare i clienti compatibili e preparare una campagna mirata.`,
      "Clienti inattivi": `Cercherei subito chi non torna da 60–90 giorni, distinguendo valore, trattamenti preferiti e probabilità di risposta.`,
      "Fatturato": `Separerei crescita apparente e marginalità reale. Ti mostrerei quali trattamenti generano valore e quali occupano agenda senza rendere abbastanza.`,
      "Team": `Analizzerei saturazione, produttività e capacità di proposta di ogni operatrice, senza trasformare i numeri in una classifica punitiva.`
    };
    addMessage(responses[answer] || "Posso analizzare questa situazione e proporti un piano operativo.", "daphne");
    setReplies(["Richiedi una demo", "Ricomincia"]);
  };

  const handleAnswer = value => {
    addMessage(value, "user");
    setReplies([]);

    if (state.step === 0) {
      state.center = value.trim() || "Il tuo centro";
      state.step = 1;
      updateDashboard();
      setTimeout(askNext, 350);
    } else if (state.step === 1) {
      state.cabins = value;
      state.step = 2;
      updateDashboard();
      setTimeout(askNext, 350);
    } else if (state.step === 2) {
      state.team = value;
      state.step = 3;
      updateDashboard();
      setTimeout(askNext, 350);
    } else if (state.step === 3) {
      state.software = value;
      state.step = 4;
      updateDashboard();
      setTimeout(askNext, 350);
    } else if (value === "Ricomincia") {
      state.step = 0; state.center = ""; state.cabins = ""; state.team = ""; state.software = "";
      body.innerHTML = "";
      addMessage("Ciao! Sono Daphne. Come si chiama il tuo centro?");
      updateDashboard();
    } else if (value === "Richiedi una demo") {
      addMessage("Perfetto. Nella versione collegata a Base44 aprirò il modulo demo con i dati che mi hai già fornito.");
      insight.textContent = "Profilo pronto per una demo personalizzata.";
      setReplies([]);
    } else {
      finalResponse(value);
    }
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = "";
    handleAnswer(value);
  });
})();

const daphneLauncher=document.getElementById("daphne-launcher");
daphneLauncher?.addEventListener("click",()=>{
  const section=document.getElementById("demo");
  const shell=document.querySelector(".interactive-shell");
  section?.scrollIntoView({behavior:"smooth",block:"start"});
  setTimeout(()=>{
    shell?.classList.add("highlight");
    document.getElementById("chat-text")?.focus();
    setTimeout(()=>shell?.classList.remove("highlight"),1400);
  },650);
});
