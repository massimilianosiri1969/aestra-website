document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.main-links')?.classList.toggle('open'));document.getElementById('demo-form')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget);const subject=encodeURIComponent('Richiesta demo AESTRA — '+(f.get('center')||''));const body=encodeURIComponent(`Nome: ${f.get('name')}
Centro: ${f.get('center')}
Email: ${f.get('email')}
Telefono: ${f.get('phone')}
Cabine: ${f.get('cabins')}
Team: ${f.get('team')}
Priorità: ${f.get('priority')}

Note:
${f.get('notes')}`);document.getElementById('form-feedback').textContent='La richiesta è pronta: si aprirà il tuo programma email.';window.location.href=`mailto:demo@aestra.it?subject=${subject}&body=${body}`;});