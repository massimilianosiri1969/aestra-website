export default {async fetch(request){
 if(request.method!=='POST')return new Response(JSON.stringify({error:'Metodo non consentito'}),{status:405,headers:{'Content-Type':'application/json'}});
 try{
 const body=await request.json();const clean=(v,n=200)=>String(v||'').trim().slice(0,n);
 const name=clean(body.name),email=clean(body.email),center=clean(body.center);
 if(!name||!center||!/^\S+@\S+\.\S+$/.test(email))return new Response(JSON.stringify({error:'Controlla i campi obbligatori'}),{status:400,headers:{'Content-Type':'application/json'}});
 const key=process.env.RESEND_API_KEY,from=process.env.DEMO_FROM_EMAIL,to=process.env.DEMO_TO_EMAIL;
 if(!key||!from||!to)return new Response(JSON.stringify({error:'Il servizio richieste demo non è ancora configurato'}),{status:503,headers:{'Content-Type':'application/json'}});
 const lines=['Nuova richiesta demo AESTRA','Nome: '+name,'Centro: '+center,'Email: '+email,'Telefono: '+clean(body.phone),'Cabine: '+clean(body.cabins,20),'Team: '+clean(body.team,20),'Priorità: '+clean(body.priority),'Note: '+clean(body.notes,2000)];
 const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:'Richiesta demo AESTRA - '+center,text:lines.join('\n')})});
 if(!res.ok)return new Response(JSON.stringify({error:'Non è stato possibile inviare la richiesta'}),{status:502,headers:{'Content-Type':'application/json'}});
 return new Response(JSON.stringify({ok:true}),{status:200,headers:{'Content-Type':'application/json'}});
 }catch{return new Response(JSON.stringify({error:'Richiesta non valida'}),{status:400,headers:{'Content-Type':'application/json'}})}
}};
