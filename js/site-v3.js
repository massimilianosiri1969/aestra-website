document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.main-links')?.classList.toggle('open'));document.getElementById('demo-form')?.addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type="submit"]'),feedback=document.getElementById('form-feedback');
 if(!form.reportValidity())return;
 button.disabled=true;feedback.textContent='Invio della richiesta in corso…';
 const payload=Object.fromEntries(new FormData(form).entries());
 try{
  const response=await fetch('/api/demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||'Invio non riuscito');
  feedback.textContent='Richiesta ricevuta. Ti contatteremo per organizzare la demo.';form.reset();
 }catch(error){feedback.textContent=error.message||'Invio non riuscito. Riprova.'}
 finally{button.disabled=false}
});
const heroMessage = document.getElementById("hero-daphne-message");
if (heroMessage) {
  const messages = [
    "Ciao, sono Daphne. Raccontami come lavori e proverò a capire se posso aiutarti.",
    "Ogni mattina collego agenda, clienti, team e numeri per mostrarti da dove iniziare.",
    "Sul sito posso conoscerti. Dentro AESTRA posso lavorare davvero con te."
  ];
  let messageIndex = 0;
  window.setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    heroMessage.animate(
      [{opacity:1,transform:"translateY(0)"},{opacity:0,transform:"translateY(-5px)"}],
      {duration:240,fill:"forwards"}
    ).finished.then(() => {
      heroMessage.textContent = messages[messageIndex];
      heroMessage.animate(
        [{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"translateY(0)"}],
        {duration:360,fill:"forwards"}
      );
    });
  }, 4800);
}
