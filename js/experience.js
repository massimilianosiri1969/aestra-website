const systemStatus=document.getElementById("system-status");
const statusWrap=document.querySelector(".status");
const daphneState=document.getElementById("daphne-state");
const daphneTitle=document.getElementById("daphne-title");
const daphneCopy=document.getElementById("daphne-copy");
const stepLabel=document.getElementById("step-label");
const progress=document.getElementById("progress");
const moduleLabel=document.getElementById("module-label");
const moduleTitle=document.getElementById("module-title");
const analysisStatus=document.getElementById("analysis-status");
const navButtons=[...document.querySelectorAll(".module-nav button")];
const moduleViews=[...document.querySelectorAll(".module-view")];
const conversation=document.getElementById("conversation");
const form=document.getElementById("conversation-form");
const input=document.getElementById("conversation-input");
const quick=document.getElementById("quick");
const restart=document.getElementById("restart");

const scenes=[
  {id:"agenda",step:"01 · Osservo",state:"DAPHNE STA GUARDANDO L’AGENDA",title:"Partirei da qui.",copy:"Vedo una finestra libera nella cabina 3. Prima di cercare nuovi clienti, proverei a riempire ciò che hai già disponibile.",label:"AGENDA",moduleTitle:"Guardo dove il centro perde tempo.",duration:4500,progress:25},
  {id:"clients",step:"02 · Collego",state:"DAPHNE STA COLLEGANDO I DATI",title:"Aspetta.",copy:"Queste sette clienti stanno entrando nella zona di inattività. È qui che il centro può perdere fatturato senza accorgersene.",label:"CLIENTI",moduleTitle:"Cerco chi rischia di non tornare.",duration:5000,progress:50},
  {id:"marketing",step:"03 · Agisco",state:"DAPHNE PREPARA UN’AZIONE",title:"Non parlerei a tutte.",copy:"Preparerei una comunicazione diversa solo per chi ha davvero motivo di tornare adesso.",label:"MARKETING",moduleTitle:"Scelgo chi contattare e come.",duration:5000,progress:75},
  {id:"insights",step:"04 · Decido",state:"DAPHNE INTERPRETA I NUMERI",title:"Ora il quadro è più chiaro.",copy:"Il fatturato sta crescendo, ma il ritorno clienti può crescere di più. È da lì che inizierei domani mattina.",label:"BUSINESS INTELLIGENCE",moduleTitle:"Collego i numeri prima di decidere.",duration:5500,progress:100}
];

function showModule(id){
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.module===id));
  moduleViews.forEach(v=>v.classList.toggle("active",v.id===`module-${id}`));
}

function runScene(index){
  const scene=scenes[index];
  if(!scene){
    daphneState.textContent="DAPHNE";
    daphneTitle.textContent="Adesso raccontami il tuo centro.";
    daphneCopy.textContent="Ho voluto mostrarti come lavoro. Ora voglio capire se posso farlo anche per te.";
    stepLabel.textContent="05 · Ti ascolto";
    systemStatus.textContent="Daphne è pronta";
    statusWrap.classList.add("ready");
    analysisStatus.textContent="Dimostrazione conclusa";
    conversation.classList.add("show");
    return;
  }

  showModule(scene.id);
  stepLabel.textContent=scene.step;
  daphneState.textContent=scene.state;
  daphneTitle.textContent=scene.title;
  daphneCopy.textContent=scene.copy;
  moduleLabel.textContent=scene.label;
  moduleTitle.textContent=scene.moduleTitle;
  analysisStatus.textContent="Daphne sta lavorando";
  progress.style.width=`${scene.progress}%`;

  setTimeout(()=>runScene(index+1),scene.duration);
}

setTimeout(()=>runScene(0),1800);

navButtons.forEach(button=>button.addEventListener("click",()=>showModule(button.dataset.module)));

function moduleFor(text){
  const t=text.toLowerCase();
  if(t.includes("agenda")||t.includes("cabine")) return "agenda";
  if(t.includes("client")||t.includes("ritorno")) return "clients";
  if(t.includes("marketing")) return "marketing";
  if(t.includes("fatturato")||t.includes("numer")||t.includes("margine")) return "insights";
  return "agenda";
}

function replyFor(text){
  const t=text.toLowerCase();
  if(t.includes("cabine")||t.includes("collaboratric")){
    return "Ho iniziato a immaginare la struttura del tuo centro. Ora voglio capire se il problema più importante riguarda agenda, ritorno clienti o fatturato.";
  }
  if(t.includes("non tornano")||t.includes("ritorno")){
    return "Questa è una priorità concreta. Dentro AESTRA potrei individuare ogni giorno chi rischia di non tornare e suggerirti quando intervenire.";
  }
  if(t.includes("fatturato")){
    return "Per capirlo davvero devo collegare saturazione, valore medio e ritorno clienti. È esattamente ciò che farei sui tuoi dati reali.";
  }
  return "Ti ascolto. Dimmi quante cabine avete e qual è oggi il problema che ti pesa di più.";
}

form.addEventListener("submit",event=>{
  event.preventDefault();
  const value=input.value.trim();
  if(!value) return;
  showModule(moduleFor(value));
  daphneState.textContent="DAPHNE STA PENSANDO";
  daphneTitle.textContent="Fammi collegare quello che mi hai detto.";
  daphneCopy.textContent="Sto costruendo una prima lettura del tuo centro.";
  analysisStatus.textContent="Prima lettura in corso";
  input.value="";
  setTimeout(()=>{
    daphneState.textContent="PRIMA LETTURA";
    daphneTitle.textContent=replyFor(value);
    daphneCopy.textContent="Sul sito posso mostrarti il metodo. Dentro AESTRA lavorerei sui dati reali.";
    analysisStatus.textContent="Prima lettura pronta";
  },1800);
});

quick.addEventListener("click",event=>{
  const button=event.target.closest("[data-prompt]");
  if(!button)return;
  input.value=button.dataset.prompt;
  input.focus();
});

restart.addEventListener("click",()=>location.reload());
