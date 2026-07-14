const intro = document.getElementById("intro-scene");
const os = document.getElementById("operating-system");
const systemStatus = document.getElementById("system-status");
const statusWrap = document.querySelector(".status");
const canvasStatus = document.getElementById("canvas-status");
const canvasStatusWrap = document.querySelector(".canvas-status");
const moduleLabel = document.getElementById("module-label");
const moduleTitle = document.getElementById("module-title");
const moduleCopy = document.getElementById("module-copy");
const daphneText = document.getElementById("daphne-text");
const daphneState = document.getElementById("daphne-state");
const dockButtons = [...document.querySelectorAll(".module-dock button")];
const moduleViews = [...document.querySelectorAll(".module-view")];
const form = document.getElementById("conversation-form");
const input = document.getElementById("conversation-input");
const quick = document.getElementById("quick-prompts");
const restart = document.getElementById("restart");

const modules = {
  agenda: {
    label:"AGENDA",
    title:"Oggi, per cabina.",
    copy:"Sto cercando ciò che merita attenzione.",
    daphne:"La cabina 3 può essere riempita oggi."
  },
  clients: {
    label:"CLIENTI",
    title:"Chi rischia di non tornare.",
    copy:"Non una lista infinita. Solo chi merita attenzione oggi.",
    daphne:"Sette clienti stanno entrando nella zona di inattività."
  },
  marketing: {
    label:"MARKETING",
    title:"Non serve parlare a tutte.",
    copy:"Serve parlare alle persone giuste, nel momento giusto.",
    daphne:"Preparerei una campagna solo per questo segmento."
  },
  stock: {
    label:"MAGAZZINO",
    title:"Quello che finirà prima.",
    copy:"Le scorte diventano una previsione, non un’emergenza.",
    daphne:"Due prodotti finiranno prima del previsto."
  },
  insights: {
    label:"BUSINESS INTELLIGENCE",
    title:"Capire, prima di decidere.",
    copy:"Sto collegando saturazione, ritorno clienti e valore medio.",
    daphne:"Il fatturato cresce, ma il ritorno clienti può crescere di più."
  }
};

function showModule(id){
  const meta = modules[id];
  dockButtons.forEach(b => b.classList.toggle("active", b.dataset.module === id));
  moduleViews.forEach(v => v.classList.toggle("active", v.id === `module-${id}`));
  moduleLabel.textContent = meta.label;
  moduleTitle.textContent = meta.title;
  moduleCopy.textContent = meta.copy;
  daphneText.textContent = meta.daphne;
}

function runDemo(){
  setTimeout(()=>{
    intro.classList.add("hide");
    os.classList.add("show");
    systemStatus.textContent = "Daphne sta osservando il centro";
  },2200);

  const sequence = [
    ["agenda", 3300],
    ["clients", 5200],
    ["marketing", 7100],
    ["insights", 9000],
    ["agenda", 10900]
  ];

  sequence.forEach(([id, delay])=>{
    setTimeout(()=>{
      canvasStatus.textContent = "Daphne sta lavorando";
      showModule(id);
    },delay);
  });

  setTimeout(()=>{
    canvasStatus.textContent = "Analisi pronta";
    canvasStatusWrap.classList.add("ready");
    systemStatus.textContent = "Daphne è pronta";
    statusWrap.classList.add("ready");
    daphneState.textContent = "DAPHNE";
    daphneText.textContent = "Adesso raccontami il tuo centro.";
  },12000);
}

runDemo();

dockButtons.forEach(button=>{
  button.addEventListener("click",()=>showModule(button.dataset.module));
});

function moduleFor(text){
  const t = text.toLowerCase();
  if(t.includes("agenda") || t.includes("cabine")) return "agenda";
  if(t.includes("client") || t.includes("ritorno")) return "clients";
  if(t.includes("marketing")) return "marketing";
  if(t.includes("magazzino") || t.includes("prodotti")) return "stock";
  if(t.includes("fatturato") || t.includes("numer") || t.includes("margine")) return "insights";
  return "agenda";
}

function replyFor(text){
  const t = text.toLowerCase();
  if(t.includes("cabine") || t.includes("collaboratric")){
    return "Ho iniziato a costruire il profilo del tuo centro. Ora voglio capire se il problema principale riguarda agenda, clienti o fatturato.";
  }
  if(t.includes("non tornano") || t.includes("ritorno")){
    return "Sto guardando le clienti a rischio. Dentro AESTRA potrei individuarle automaticamente ogni giorno.";
  }
  if(t.includes("fatturato")){
    return "Sto aprendo Business Intelligence. Per una risposta seria devo collegare saturazione, valore medio e ritorno clienti.";
  }
  return "Ti ascolto. Dimmi quante cabine avete e qual è oggi il problema più urgente.";
}

form.addEventListener("submit",event=>{
  event.preventDefault();
  const value = input.value.trim();
  if(!value) return;

  const target = moduleFor(value);
  daphneState.textContent = "DAPHNE STA LAVORANDO";
  daphneText.textContent = "Sto collegando ciò che mi hai raccontato al software.";
  canvasStatus.textContent = "Analisi in corso";
  canvasStatusWrap.classList.remove("ready");
  showModule(target);
  input.value = "";

  setTimeout(()=>{
    daphneState.textContent = "PRIMA LETTURA";
    daphneText.textContent = replyFor(value);
    canvasStatus.textContent = "Analisi pronta";
    canvasStatusWrap.classList.add("ready");
  },1300);
});

quick.addEventListener("click",event=>{
  const button = event.target.closest("[data-prompt]");
  if(!button) return;
  input.value = button.dataset.prompt;
  input.focus();
});

restart.addEventListener("click",()=>location.reload());
