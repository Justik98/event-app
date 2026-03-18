# App Eventi

Piccola app web con backend Node.js e salvataggio condiviso su file JSON.

## Cosa fa

- crea eventi con titolo, descrizione e data opzionale
- mostra tutti gli eventi salvati a chiunque apra l'app
- salva i dati nel file `data/events.json`
- elimina automaticamente gli eventi dal giorno successivo alla data schedulata

Nota: gli eventi senza data non vengono eliminati automaticamente.

## Avvio rapido

```bash
cd /Users/diegogiustizia/eventi-app
npm start
```

Poi visita `http://localhost:3000`.

## Deploy semplice consigliato: Railway

Per questa app il modo piu' semplice e' usare Railway con un volume persistente, cosi' il file JSON rimane salvato anche dopo i deploy.

### Prima del deploy

Metti il progetto in una repository GitHub.

### Passi su Railway

1. Crea un nuovo progetto da GitHub.
2. Seleziona la repository di `eventi-app`.
3. Railway usera' il comando di avvio `npm start`.
4. Aggiungi un volume persistente e montalo, per esempio, in `/data`.
5. Aggiungi la variabile d'ambiente `DATA_DIR=/data`.
6. Fai partire il deploy.

In questo modo gli eventi verranno scritti in `/data/events.json` invece che nella cartella locale del progetto.

### Note utili

- la porta viene letta automaticamente da `process.env.PORT`
- l'app e' gia' pronta per lavorare dietro HTTPS
- dopo il deploy puoi installarla come PWA dal browser del telefono

## Uso da telefono

### Prova locale sulla tua rete Wi-Fi

1. Avvia il server sul Mac con `npm start`
2. Apri dal telefono `http://IP-DEL-TUO-MAC:3000`
3. Telefono e Mac devono stare sulla stessa rete

### Installazione come app

Quando l'app e' online in HTTPS:

- su iPhone: Safari > Condividi > `Aggiungi a Home`
- su Android: Chrome > menu > `Installa app`
