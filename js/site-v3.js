document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.main-links')?.classList.toggle('open'));document.getElementById('demo-form')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=encodeURIComponent('Richiesta demo AESTRA — '+(f.get('center')||''));const body=encodeURIComponent(`Nome: ${f.get('name')}
Centro: ${f.get('center')}
Email: ${f.get('email')}
Telefono: ${f.get('phone')}
Cabine: ${f.get('cabins')}
Team: ${f.get('team')}
Priorità: ${f.get('priority')}

Note:
${f.get('notes')}`);document.getElementById('form-feedback').textContent='La richiesta è pronta: si aprirà il tuo programma email.';window.location.href=`mailto:demo@aestra.it?subject=${subject}&body=${body}`;});
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
