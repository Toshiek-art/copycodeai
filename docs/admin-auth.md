# Autenticazione area admin

L'area `/admin` (incluso `/admin/studio`) utilizza un login proprietario basato su cookie firmati.
La protezione è attiva sia in sviluppo (se presenti le variabili) sia su Cloudflare Pages.

## Variabili richieste

| Nome | Descrizione |
| ---- | ----------- |
| `ADMIN_PASSWORD_HASH` | Hash PBKDF2-SHA256 della password amministratore (formato `pbkdf2-sha256$ITERAZIONI$SALT$HASH`). |
| `ADMIN_SESSION_SECRET` | Stringa lunga e casuale usata per firmare i cookie di sessione. |

Imposta le variabili:

```bash
# Cloudflare Pages (Preview e Production)
wrangler pages secret put ADMIN_PASSWORD_HASH
wrangler pages secret put ADMIN_SESSION_SECRET

# Sviluppo locale (.env)
ADMIN_PASSWORD_HASH=...
ADMIN_SESSION_SECRET=...
```

## Generare un nuovo hash password

Esegui uno script Node (usa almeno Node 18):

```bash
node --input-type=module <<'JS'
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const password = process.env.PASSWORD;
if (!password) {
  throw new Error('Imposta la variabile PASSWORD prima di eseguire lo script.');
}

const iterations = 150000;
const salt = randomBytes(16);
const derived = pbkdf2Sync(password, salt, iterations, 32, 'sha256');

function toBase64Url(buffer) {
  return buffer
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const hash = `pbkdf2-sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(derived)}`;
console.log(hash);
JS
```

Uso tipico:

```bash
PASSWORD='TuaPasswordSuperSegreta' node --input-type=module script.js
```

Copia l'output in `ADMIN_PASSWORD_HASH` e conserva la password in un password manager.

## Flusso di autenticazione

1. `/admin/login` mostra un form con password singola.
2. La Pages Function `functions/admin/login.ts` verifica la password, crea un token firmato e imposta il cookie `ccai_admin_session` (validità 8 ore).
3. Il middleware (`functions/_middleware.ts` su Cloudflare, `src/middleware.ts` in sviluppo) controlla il cookie per tutte le rotte sotto `/admin` e `/studio`.
4. `/admin/logout` elimina il cookie e reindirizza alla pagina di login.
5. `/admin/_debug` restituisce un JSON con lo stato della sessione attuale.

## Rotazione credenziali

- Genera un nuovo hash e aggiorna `ADMIN_PASSWORD_HASH` su Pages e nel tuo `.env`.
- Aggiorna `ADMIN_SESSION_SECRET` se vuoi invalidare tutte le sessioni attive.
- Chiedi agli utenti di fare logout/login per ottenere il nuovo token.

## Risoluzione dei problemi

| Sintomo | Azione |
| ------- | ------ |
| Accesso libero senza password | Verifica che `ADMIN_SESSION_SECRET` sia impostata (in sviluppo viene bypassato se manca). |
| Errore 500 su `/admin` | Mancano una o entrambe le variabili richieste. |
| Login sempre “password errata” | Rigenera l'hash assicurandoti di non incollare spazi o virgolette. |
| Logout non invalida la sessione | Controlla che il browser accetti cookie `HttpOnly` e che l'orologio di sistema sia corretto. |
