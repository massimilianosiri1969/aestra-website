
const statusEl = document.getElementById("os-status");
const statusWrap = document.querySelector(".os-status");
const panels = [...document.querySelectorAll(".floating-panel")];
const railButtons = [...document.querySelectorAll(".module-rail button")];
const form = document.getElementById("talk-form");
const input = document.getElementById("talk-input");
const starterActions = document.getElementById("starter-actions");
const daphneState = document.getElementById("daphne-state");
const daphneMessage = document.getElementById("daphne-message");
const consolePrompt = document.getElementById("console-prompt");
const thinkingLine = document.getElementById("thinking-line");
const thinkingCopy = document.getElementById("thinking-copy");
const orb = document.getElementById("daphne-orb");
const restart = document.getElementById("restart");

const profile = {
  center: document.getElementById("p-center"),
  cabins: document.getElementById("p-cabins"),
  team: document.getElementById("p-team"),
  goal: document.getElementById("p-goal")
};

const sequences = [
  ["Sistema in avvio", "briefing"],
  ["Agenda sincronizzata", "agenda"],
  ["Clienti caricati", "clients"],
  ["Business Intelligence pronta", "insights"],
  ["Daphne è pronta", "briefing"]
];

let seqIndex = 0;
function activatePanel(id){
  panels.forEach(p => p.classList.toggle("active", p.id === id));
  railButtons.forEach(b => b.classList.toggle("active", b.dataset.panel === id));
}

function runIntro(){
  panels.forEach((p,i)=>setTimeout(()=>p.classList.add("visible"),250+i*180));
  const timer = setInterval(()=>{
    const [label,id] = sequences[seqIndex];
    statusEl.textContent = label;
    activatePanel(id);
    seqIndex++;
    if(seqIndex >= sequences.length){
      clearInterval(timer);
      statusWrap.classList.add("ready");
      setTimeout(()=>activatePanel("briefing"),700);
    }
  },720);
}
runIntro();

railButtons.forEach(button=>{
  button.addEventListener("click",()=>activatePanel(button.dataset.panel));
});

function updateProfile(text){
  const lower = text.toLowerCase();
  const cabins = lower.match(/(\d+)\s*cabine?/);
  const team = lower.match(/(\d+)\s*(collaboratrici|collaboratori|persone|dipendenti|operatrici|operatori)/);
  if(lower.includes("centro estetico")){
    profile.center.textContent = "Centro estetico";
    profile.center.classList.add("known");
  }
  if(cabins){
    profile.cabins.textContent = `Cabine ${cabins[1]}`;
    profile.cabins.classList.add("known");
  }
  if(team){
    profile.team.textContent = `Team ${team[1]}`;
    profile.team.classList.add("known");
  }
  if(lower.includes("fatturato")){
    profile.goal.textContent = "Aumentare il fatturato";
    profile.goal.classList.add("known");
  }else if(lower.includes("non tornano") || lower.includes("ritorno")){
    profile.goal.textContent = "Far tornare le clienti";
    profile.goal.classList.add("known");
  }
}

function panelFor(text){
  const lower = text.toLowerCase();
  if(lower.includes("agenda") || lower.includes("cabine")) return "agenda";
  if(lower.includes("client") || lower.includes("ritorno")) return "clients";
  if(lower.includes("fatturato") || lower.includes("numer") || lower.includes("margine")) return "insights";
  if(lower.includes("marketing")) return "marketing";
  if(lower.includes("magazzino") || lower.includes("prodotti")) return "stock";
  return "briefing";
}

function responseFor(text){
  const lower = text.toLowerCase();
  if(lower.includes("cabine") || lower.includes("collaboratric")){
    return "Ho iniziato a costruire il profilo del tuo centro. Ora voglio capire quale area pesa di più: agenda, ritorno clienti o fatturato.";
  }
  if(lower.includes("non tornano") || lower.includes("ritorno")){
    return "Sto guardando il modulo Clienti. Qui posso mostrarti il metodo; dentro AESTRA individuerei automaticamente chi rischia di non tornare e quando intervenire.";
  }
  if(lower.includes("fatturato")){
    return "Sto aprendo Business Intelligence. Per una risposta seria devo collegare saturazione, valore medio, ritorno clienti e marginalità. Dentro AESTRA lo farei sui tuoi dati reali.";
  }
  if(lower.includes("marketing")){
    return "Sto aprendo Marketing. La differenza non è inviare più messaggi, ma sapere a chi parlare, quando e con quale proposta.";
  }
  return "Ti ascolto. Raccontami quante cabine avete, quante persone lavorano con te e qual è oggi il problema più urgente.";
}

function handleMessage(text){
  updateProfile(text);
  const target = panelFor(text);
  daphneState.textContent = "DAPHNE STA LAVORANDO";
  daphneMessage.textContent = "Aspetta un momento.";
  consolePrompt.textContent = "Sto collegando ciò che mi hai raccontato al software.";
  thinkingLine.classList.add("active");
  thinkingCopy.textContent = `Sto aprendo ${target === "insights" ? "Business Intelligence" : target}…`;
  orb.classList.add("thinking");
  activatePanel(target);

  setTimeout(()=>{
    daphneState.textContent = "PRIMA LETTURA";
    daphneMessage.textContent = responseFor(text);
    consolePrompt.textContent = "Questa è solo una prima lettura pubblica.";
    thinkingLine.classList.remove("active");
    thinkingCopy.textContent = "La Memoria Strategica è stata aggiornata.";
    orb.classList.remove("thinking");
  },1500);
}

form.addEventListener("submit",event=>{
  event.preventDefault();
  const value = input.value.trim();
  if(!value) return;
  input.value = "";
  handleMessage(value);
});

starterActions.addEventListener("click",event=>{
  const button = event.target.closest("[data-prompt]");
  if(!button) return;
  input.value = button.dataset.prompt;
  input.focus();
});

restart.addEventListener("click",()=>location.reload());
