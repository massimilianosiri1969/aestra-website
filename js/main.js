
const form=document.getElementById("prompt-form");
const input=document.getElementById("prompt-input");
const response=document.getElementById("response-text");
const buttons=document.querySelectorAll("[data-prompt]");
const insightTitle=document.getElementById("insight-title");
const insightCopy=document.getElementById("insight-copy");
const opportunities=document.getElementById("opportunities");
const clients=document.getElementById("clients");
const spaces=document.getElementById("spaces");
const impact=document.getElementById("impact");

buttons.forEach(btn=>btn.addEventListener("click",()=>{
  input.value=btn.dataset.prompt;
  input.focus();
}));

function analyse(text){
  const value=text.toLowerCase();
  let reply="Ho iniziato a leggere il tuo centro. Vedo già alcune aree su cui potremmo lavorare insieme.";
  let title="Prima analisi completata.";
  let copy="Ho individuato opportunità operative da approfondire.";
  let opp=4, cli=12, spa=2, imp="+18%";

  if(value.includes("4 cabine") || value.includes("cabine")){
    reply="Con quattro cabine, la prima cosa che controllerei è la saturazione reale per fascia oraria. Potresti avere spazi vuoti nascosti anche con un’agenda apparentemente piena.";
    title="La saturazione non è uniforme.";
    copy="Vedo margine per distribuire meglio appuntamenti e trattamenti ad alta marginalità.";
    opp=6; spa=4; imp="+22%";
  }
  if(value.includes("primo trattamento") || value.includes("perdo")){
    reply="Il problema probabilmente non è il primo trattamento, ma ciò che accade nelle 72 ore successive. Creerei un percorso automatico di follow-up e ritorno.";
    title="Il punto critico è dopo il primo trattamento.";
    copy="Daphne suggerisce un percorso di riattivazione entro 7 giorni.";
    cli=27; opp=7; imp="+31%";
  }
  if(value.includes("fatturato") || value.includes("prezzi")){
    reply="Per aumentare il fatturato senza alzare i prezzi lavorerei su tre leve: riempimento agenda, vendita di percorsi e recupero clienti inattivi.";
    title="Tre leve di crescita senza aumentare i prezzi.";
    copy="Agenda, percorsi e riattivazione sono le aree con impatto più rapido.";
    opp=8; cli=19; spa=3; imp="+26%";
  }

  response.textContent=reply;
  insightTitle.textContent=title;
  insightCopy.textContent=copy;
  opportunities.textContent=opp;
  clients.textContent=cli;
  spaces.textContent=spa;
  impact.textContent=imp;

  document.querySelectorAll(".chart div").forEach((bar,i)=>{
    const heights=[38,49,44,61,70,82,94];
    bar.style.height=(heights[i]+Math.floor(Math.random()*7))+"%";
  });

  document.getElementById("platform").scrollIntoView({behavior:"smooth",block:"center"});
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const value=input.value.trim();
  if(!value)return;
  response.textContent="Sto analizzando...";
  setTimeout(()=>analyse(value),700);
});
