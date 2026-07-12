const menu=document.getElementById('menu');const nav=document.getElementById('nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));const items=[['CLIENTE DA RECUPERARE','Giulia Rossi non torna da 73 giorni.','Prepara messaggio'],['AGENDA DA OTTIMIZZARE','Domani hai 2 spazi compatibili con 14 clienti.','Riempi agenda'],['PRODOTTO DA RILANCIARE','Le vendite della crema anti-age sono sotto le attese.','Crea promozione']];let i=0;const card=document.getElementById('ai-insight');setInterval(()=>{card?.classList.add('fade');setTimeout(()=>{i=(i+1)%items.length;document.getElementById('ai-label').textContent=items[i][0];document.getElementById('ai-text').textContent=items[i][1];document.getElementById('ai-action').textContent=items[i][2];card?.classList.remove('fade')},350)},4200);
const header=document.querySelector('.site-header');
window.addEventListener('scroll',()=>header?.classList.toggle('scrolled',window.scrollY>24),{passive:true});
const heroVisual=document.querySelector('.hero-visual');
heroVisual?.addEventListener('mousemove',e=>{
  const r=heroVisual.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5;
  const y=(e.clientY-r.top)/r.height-.5;
  const dash=heroVisual.querySelector('.dashboard-img');
  const phone=heroVisual.querySelector('.phone-img');
  if(dash) dash.style.transform=`rotateY(${x*5-4}deg) rotateX(${-y*3+1}deg) translate(${x*4}px,${y*4}px)`;
  if(phone) phone.style.transform=`rotate(${4+x*3}deg) translate(${x*7}px,${y*7}px)`;
});
heroVisual?.addEventListener('mouseleave',()=>{
  const dash=heroVisual.querySelector('.dashboard-img');
  const phone=heroVisual.querySelector('.phone-img');
  if(dash) dash.style.transform='rotateY(-4deg) rotateX(1deg)';
  if(phone) phone.style.transform='rotate(4deg)';
});

const daphneHero=document.querySelector('.daphne-hero-img');
document.querySelector('.hero-visual')?.addEventListener('mousemove',e=>{
  const r=e.currentTarget.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5;
  const y=(e.clientY-r.top)/r.height-.5;
  if(daphneHero) daphneHero.style.transform=`translate(${x*6}px,${y*5}px)`;
});
document.querySelector('.hero-visual')?.addEventListener('mouseleave',()=>{if(daphneHero)daphneHero.style.transform='translate(0,0)'});

const signatureCard=document.querySelector('.signature-card');
document.querySelector('.hero-visual')?.addEventListener('mousemove',e=>{
  const r=e.currentTarget.getBoundingClientRect();
  const x=(e.clientX-r.left)/r.width-.5;
  const y=(e.clientY-r.top)/r.height-.5;
  if(signatureCard) signatureCard.style.transform=`translate(${x*5}px,${y*5}px)`;
});
document.querySelector('.hero-visual')?.addEventListener('mouseleave',()=>{
  if(signatureCard) signatureCard.style.transform='translate(0,0)';
});

const isMobile=()=>window.matchMedia('(max-width:760px)').matches;
document.querySelector('.hero-visual')?.addEventListener('mousemove',()=>{
  if(isMobile()){
    if(signatureCard) signatureCard.style.transform='none';
    if(daphneHero) daphneHero.style.transform='none';
  }
});

window.addEventListener('resize',()=>{
  if(window.matchMedia('(max-width:760px)').matches){
    const signatureCard=document.querySelector('.signature-card');
    const daphneHero=document.querySelector('.daphne-hero-img');
    const dashboard=document.querySelector('.dashboard-img');
    const phone=document.querySelector('.phone-img');
    if(signatureCard) signatureCard.style.transform='none';
    if(daphneHero) daphneHero.style.transform='none';
    if(dashboard) dashboard.style.transform='none';
    if(phone) phone.style.transform='none';
  }
});
