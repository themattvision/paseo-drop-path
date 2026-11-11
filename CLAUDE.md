# paseo-drop-path

Plugin Paseo (solo client, desktop). Quando si trascinano file o cartelle dal Mac sul campo messaggio di una chat, invece del caricamento sul daemon inserisce nel messaggio il percorso locale (tra virgolette se contiene spazi).

## Come funziona
- `client/web.ts` registra un listener `drop` sulla finestra in fase di cattura (unico punto con globali DOM, protetto da `Platform.OS === "web"`).
- Il percorso reale arriva da `window.paseoDesktop.webUtils.getPathForFile` (esposto dal preload Electron di Paseo). Se non è disponibile o fallisce, il plugin NON intercetta e Paseo carica il file come prima.
- Il campo di testo si trova dal DOM: `[data-testid="message-input-root"] textarea`, risalendo dal bersaglio del drop. Il valore si imposta con il setter nativo di `HTMLTextAreaElement` più un evento `input`, così React Native Web aggiorna lo stato.
- Dopo l'inserimento il plugin rimanda a Paseo un `drop` vuoto sullo stesso bersaglio: serve ad azzerare l'overlay "rilascia qui" senza caricare nulla (il listener ignora gli eventi non fidati, `isTrusted` falso).
- Esclusi dall'intercettazione: terminale (gestisce già i percorsi), esplora file e vista file.

## Trappole
- Non esiste un'API ufficiale dei plugin per il drop o per la bozza del composer: il plugin dipende dal DOM dell'app. SINTOMO se si rompe dopo un aggiornamento di Paseo: il drop torna a caricare il file, oppure il testo non compare nel campo. Controllare che `message-input-root` esista ancora nel bundle (`app-dist/_expo/static/js/web/index-*.js`) e che il preload esponga ancora `paseoDesktop.webUtils`.
- Percorso valido solo sul computer dell'app: con chat su un host remoto (VPS) il file non esiste lì.
- Dopo modifiche al sorgente: `npm run typecheck`, poi `paseo plugin reload paseo-drop-path` (mai riavviare il daemon).
- Il test vero richiede un drag reale da Finder; non è automatizzabile da script.
