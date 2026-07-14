const buttons=[...document.querySelectorAll(".rail button")];
const views=[...document.querySelectorAll(".view")];
const daphneLine=document.getElementById("daphne-line");
const askState=document.getElementById("ask-state");
const askMessage=document.getElementById("ask-message");
const form=document.getElementById("ask-form");
const input=document.getElementById("ask-input");
const quick=document.getElementById("quick");
const restart=document.getElementById("restart");

const messages={
  today:"Ho trovato una cosa interessante.",
  agenda:"Sto guardando l’agenda.",
  clients:"Queste clienti meritano attenzione oggi.",
  marketing:"Non serve parlare a tutti.",
  stock:"Due prodotti finiranno prima del previsto.",
  insights:"Qui si vede cosa sta davvero cambiando."
};

function showView(id){
  views.forEach(v=>v.classList.toggle("active",v.id===`view-${id}`));
  buttons.forEach(b=>b.classList.toggle("active",b.dataset.view===id));
  daphneLine.textContent=messages[id]||messages.today;
}

buttons.forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));

function viewFor(text){
  const t=text.toLowerCase();
  if(t.includes("agenda")||t.includes("cabine")) return "agenda";
  if(t.includes("client")||t.includes("ritorno")) return "clients";
  if(t.includes("marketing")) return "marketing";
  if(t.includes("magazzino")||t.includes("prodotti")) return "stock";
  if(t.includes("fatturato")||t.includes("numer")||t.includes("margine")) return "insights";
  return "today";
}

function replyFor(text){
  const t=text.toLowerCase();
  if(t.includes("cabine")||t.includes("collaboratric")){
    return "Ho iniziato a costruire il profilo del tuo centro. Ora voglio capire se il problema principale riguarda agenda, clienti o fatturato.";
  }
  if(t.includes("ritorno")||t.includes("non tornano")){
    return "Sto guardando le clienti a rischio. Sul sito posso mostrarti il metodo; dentro AESTRA le individuerei automaticamente ogni giorno.";
  }
  if(t.includes("fatturato")){
    return "Sto aprendo Business Intelligence. Per una risposta seria devo collegare saturazione, valore medio e ritorno clienti.";
  }
  return "Ti ascolto. Dimmi quante cabine avete e qual è oggi il problema più urgente.";
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const value=input.value.trim();
  if(!value) return;
  const target=viewFor(value);
  askState.textContent="DAPHNE STA LAVORANDO";
  askMessage.textContent="Sto collegando ciò che mi hai raccontato al software.";
  showView(target);
  input.value="";
  setTimeout(()=>{
    askState.textContent="PRIMA LETTURA";
    askMessage.textContent=replyFor(value);
  },1200);
});

quick.addEventListener("click",e=>{
  const b=e.target.closest("[data-prompt]");
  if(!b) return;
  input.value=b.dataset.prompt;
  input.focus();
});

restart.addEventListener("click",()=>location.reload());

const intro=["today","agenda","clients","insights","today"];
intro.forEach((id,i)=>setTimeout(()=>showView(id),700+i*700));
