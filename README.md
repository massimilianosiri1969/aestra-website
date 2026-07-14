# AESTRA — Daphne 2C Complete Experience

La 2C contiene integralmente le fasi 2A e 2B e completa la prima esperienza pubblica testabile.

## Motore
- backend Vercel collegato alla Responses API;
- memoria della conversazione;
- Structured Outputs;
- moderazione;
- protezione base da prompt injection;
- limite massimo di 10 scambi;
- chiave API esclusivamente server-side;
- `store: false`;
- timeout, scadenza sessione e rate limiting iniziale.

## Esperienza 2C
- percorso visivo in quattro fasi: conoscenza, prima lettura, valore, prossimo passo;
- contatore degli scambi e barra di avanzamento;
- suggerimenti dinamici basati sulle informazioni mancanti;
- Memoria Strategica che si apre quando acquisisce nuovi dati;
- indicatori di completezza del profilo;
- dashboard inizialmente neutra, senza KPI inventati;
- stati visivi di attesa, errore, conclusione e riavvio;
- CTA contestuali per demo e prova;
- sezione di passaggio dal dialogo pubblico all’attivazione di AESTRA;
- ottimizzazione mobile;
- limite di 1.800 caratteri e contatore del testo.

## Configurazione Vercel
In **Settings → Environment Variables** aggiungere:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` = `gpt-5-mini`

Quindi eseguire un nuovo deploy.

## Test consigliato
Provare almeno:
1. descrizione di cabine e team;
2. correzione di un dato già fornito;
3. domanda “mensile o annuale?”;
4. domanda su come collegare Daphne ad AESTRA;
5. richiesta di consulenza molto approfondita;
6. insulto singolo e ripetuto;
7. tentativo di chiedere il prompt interno;
8. conversazione fino al decimo scambio;
9. visualizzazione da iPhone;
10. reset e scadenza della sessione.

## Nota
Il rate limiting incluso usa memoria temporanea della funzione serverless ed è adatto ai test. Prima del lancio pubblico definitivo servirà un archivio condiviso.
