# AESTRA Website V5 — Interactive Daphne

Questa versione fonde il cockpit operativo della V4 con l'interazione reale sviluppata nelle fasi 2A–2C.

## Homepage
- Daphne è interattiva direttamente nella hero;
- non è necessario cambiare pagina per iniziare il dialogo;
- la chat usa `/api/daphne`;
- memoria sintetica di centro, team, cabine e obiettivo;
- il cockpit reagisce ai dati acquisiti;
- messaggi utente e Daphne sono visibili dentro il software;
- suggerimenti iniziali e contatore caratteri;
- gestione degli stati online, elaborazione, errore e conclusione;
- piattaforma operativa sempre visibile.

## Vercel
Configurare:
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-5-mini`

Dopo aver aggiunto le variabili eseguire un nuovo deploy.
