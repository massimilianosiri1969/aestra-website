const systemStatus=document.getElementById("system-status");
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
const form=document.getElementById("conversation-form");
const input=document.getElementById("conversation-input");
const quick=document.getElementById("quick");
const pauseButton=document.getElementById("pause");
const prevButton=document.getElementById("prev");
const nextButton=document.getElementById("next");
const restart=document.getElementById("restart");

const scenes=[
  {id:"agenda",step:"01 · Agenda",state:"DAPHNE OSSERVA",title:"Partirei da qui.",copy:"Vedo una finestra libera nella cabina 3. Prima di cercare nuovi clienti, proverei a riempire ciò che hai già disponibile.",label:"AGENDA",moduleTitle:"Guardo dove il centro perde tempo."},
  {id:"clients",step:"02 · Clienti",state:"DAPHNE COLLEGA",title:"Aspetta.",copy:"Queste sette clienti stanno entrando nella zona di inattività. È qui che il centro può perdere fatturato senza accorgersene.",label:"CLIENTI",moduleTitle:"Cerco chi rischia di non tornare."},
  {id:"marketing",step:"03 · Marketing",state:"DAPHNE AGISCE",title:"Non parlerei a tutte.",copy:"Preparerei una comunicazione diversa solo per chi ha davvero motivo di tornare adesso.",label:"MARKETING",moduleTitle:"Scelgo chi contattare e come."},
  {id:"insights",step:"04 · Numeri",state:"DAPHNE INTERPRETA",title:"Ora il quadro è più chiaro.",copy:"Il fatturato sta crescendo, ma il ritorno clienti può crescere di più. È da lì che inizierei domani mattina.",label:"BUSINESS INTELLIGENCE",moduleTitle:"Collego i numeri prima di decidere."}
];

let current=0;
let paused=false;
let timer=null;
const sceneDuration=11000;

function showModule(id){
  navButtons.forEach(b=>b.classList.toggle("active",b.dataset.module===id));
  moduleViews.forEach(v=>v.classList.toggle("active",v.id===`module-${id}`));
}

function renderScene(index, schedule=true){
  current=(index+scenes.length)%scenes.length;
  const scene=scenes[current];
  showModule(scene.id);
  stepLabel.textContent=scene.step;
  daphneState.textContent=scene.state;
  daphneTitle.textContent=scene.title;
  daphneCopy.textContent=scene.copy;
  moduleLabel.textContent=scene.label;
  moduleTitle.textContent=scene.moduleTitle;
  analysisStatus.textContent="Daphne sta lavorando";
  progress.style.width=`${((current+1)/scenes.length)*100}%`;
  systemStatus.textContent="Daphne è pronta";

  clearTimeout(timer);
  if(schedule && !paused){
    timer=setTimeout(()=>renderScene(current+1,true),sceneDuration);
  }
}

renderScene(0,true);

pauseButton.addEventListener("click",()=>{
  paused=!paused;
  pauseButton.textContent=paused?"Riprendi":"Pausa";
  if(paused){
    clearTimeout(timer);
  }else{
    renderScene(current,true);
  }
});

prevButton.addEventListener("click",()=>{
  clearTimeout(timer);
  renderScene(current-1,!paused);
});
nextButton.addEventListener("click",()=>{
  clearTimeout(timer);
  renderScene(current+1,!paused);
});

navButtons.forEach(button=>button.addEventListener("click",()=>{
  paused=true;
  pauseButton.textContent="Riprendi";
  clearTimeout(timer);
  const index=scenes.findIndex(s=>s.id===button.dataset.module);
  renderScene(index,false);
}));

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

const chatHistory=[];let chatTurn=0;let chatProfile={};let sending=false;
form.addEventListener("submit",async event=>{
 event.preventDefault();if(sending)return;
 const value=input.value.trim();if(!value)return;
 sending=true;paused=true;pauseButton.textContent="Riprendi";clearTimeout(timer);
 input.value="";const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
 daphneState.textContent="DAPHNE TI ASCOLTA";daphneTitle.textContent="Sto ascoltando.";daphneCopy.textContent="Un momento, preparo una risposta per il tuo centro.";
 try{
  const res=await fetch("/api/daphne",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:value,messages:chatHistory.slice(-10),profile:chatProfile,turn:++chatTurn,maxTurns:10})});
  const data=await res.json();if(!res.ok)throw new Error(data.error||"Servizio temporaneamente non disponibile");
  chatHistory.push({role:"user",content:value},{role:"assistant",content:data.answer});
  chatProfile=data.profile||chatProfile;
  daphneState.textContent="DAPHNE · DIGITAL AESTRA SPECIALIST";
  daphneTitle.textContent=data.endConversation?"Continuiamo insieme.":"Ti rispondo.";
  daphneCopy.textContent=data.answer;
  analysisStatus.textContent="Risposta personalizzata";
  if(data.conversion?.show){const note=document.querySelector(".insight-note");if(note){note.querySelector("small").textContent="SCOPRI AESTRA";note.querySelector("strong").textContent=data.conversion.title||"Prenota una demo";}}
  if(data.endConversation){input.disabled=true;submit.disabled=true;input.placeholder="La conversazione dimostrativa è conclusa.";}
 }catch(err){daphneState.textContent="CONNESSIONE";daphneTitle.textContent="Riproviamo?";daphneCopy.textContent=err.message||"La connessione non è disponibile.";}
 finally{sending=false;if(!input.disabled)submit.disabled=false;}
});
quick.addEventListener("click",event=>{
  const button=event.target.closest("[data-prompt]");
  if(!button)return;
  input.value=button.dataset.prompt;
  input.focus();
});

restart.addEventListener("click",()=>location.reload());
