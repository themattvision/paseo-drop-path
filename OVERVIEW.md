Quando trascini un file o una cartella dal Mac sul campo messaggio di una chat, Paseo di solito lo carica sul daemon. Questo plugin lo evita: scrive nel messaggio il percorso locale del file o della cartella, così l'agente lo legge direttamente dal disco senza attese per file grandi.

Funziona sull'app desktop, con uno o più elementi trascinati insieme. I percorsi con spazi vengono messi tra virgolette. Il terminale, l'esplorazione file e la vista file mantengono il comportamento normale.

Il percorso inserito è quello del computer su cui gira l'app. Se la chat è su un altro host, per esempio un server remoto, quel percorso non esiste lì e l'agente non potrà aprirlo. Il plugin non legge né invia il contenuto dei file: usa solo il loro percorso. Se Paseo cambia la struttura del campo messaggio, il plugin può smettere di inserire il testo.
