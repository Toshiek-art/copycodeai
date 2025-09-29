# Roadmap per ricostruire CopyCodeAI da zero

Questo documento descrive come replicare l'attuale struttura del sito mantenendo contenuti, temi e pagine, ma riprogettando completamente la parte di accesso e contatto. Usalo come guida per avviare un nuovo repository “pulito”.

## 1. Stack e dipendenze principali

- **Framework**: Astro 5 con output `server` (adattatore Cloudflare Pages).
- **UI e styling**: Tailwind CSS 3, preset tipografico, font Inter + Space Grotesk.
- **Componenti React opzionali**: supporto con `@astrojs/react` (usato per player video e animazioni AOS).
- **CMS**: contenuti serviti da Sanity (client ufficiale + `@sanity/astro`).
- **Animazioni**: AOS (Animate On Scroll) inizializzato via script custom.
- **Icone e asset**: immagini e SVG in `public/`, caricate da Astro.

### Installazione di base

```bash
npm create astro@latest copycodeai
cd copycodeai
npm install @astrojs/cloudflare @astrojs/react @astrojs/tailwind @tailwindcss/typography aos @sanity/astro @sanity/client astro-portabletext @fontsource-variable/inter @fontsource-variable/space-grotesk @fontsource/inter @fontsource/space-grotesk @fontsource/jetbrains-mono encoding react react-dom resend
npm install -D tailwindcss postcss autoprefixer typescript @types/react @types/react-dom wrangler
```

Configura Astro (`astro.config.mjs`) con adattatore Cloudflare e integra tailwind e react come nel progetto attuale.

## 2. Struttura delle cartelle da replicare

```
├── public/              # asset statici, favicons, immagini portfolio
├── src/
│   ├── components/      # componenti UI riutilizzabili (hero, cards, moduli)
│   ├── data/            # dati statici JSON/TS (link, highlight)
│   ├── layouts/         # layout principali (BaseLayout, PostLayout)
│   ├── lib/             # helper lato server/client (es. sanityClient)
│   ├── pages/
│   │   ├── index.astro          # homepage con servizi, CTA, progetti
│   │   ├── work/                # listing progetti
│   │   ├── ai/solutions/[slug]  # schede AI asset
│   │   ├── writing/[slug]       # articoli blog
│   │   ├── contact.astro        # form contatti (UI da mantenere)
│   │   ├── admin/               # area riservata (UI dashboard da preservare)
│   │   └── ...                  # 404, privacy, tos, etc.
│   ├── scripts/         # init AOS, utilità lato client
│   ├── styles/          # fogli stile globali (tailwind entry, variabili)
│   ├── templates/       # markup preimpostato per landing/demo
│   └── themes/          # definizione palette e variabili CSS
├── functions/           # Pages Functions per API e future logiche protette
│   ├── api/             # endpoint JSON (es. template list, health)
│   ├── admin/           # handler area riservata da riscrivere ex-novo
│   └── _middleware.ts   # middleware globale Cloudflare (da reimplementare)
├── docs/                # documentazione operativa
├── infra/               # migrazioni SQL per D1/SQLite
└── db/                  # schema locale, seed iniziale
```

## 3. Contenuti da mantenere

1. **Pagine marketing** (`index`, `work`, `writing`, `tos`, `privacy`, `contact`).
   - Copia i file `.astro` e i componenti collegati mantenendo CTA, copy e sezioni.
   - Assicurati di preservare il markup semantico e le classi Tailwind.

2. **Templates e dati** (`src/data`, `src/templates`).
   - Esporta JSON/YAML con i dati di progetto, case study, testimonial.
   - Importali nel nuovo repo come moduli TS o file statici.

3. **Sanity integration** (`src/lib/sanity.ts`).
   - Porta la configurazione del client (projectId, dataset, API version) e le query già usate.
   - Mantieni la pagina `admin/studio` che embedda Sanity Studio o linka a quello esterno.

4. **Funzioni API esistenti** (ping, templates listing, health check).
   - Ricopia la struttura di risposta e i binding (D1/KV) ma senza includere codice di login attuale.

5. **Migrazioni database** (`infra/migrations`, `db/schema.sql`).
   - Conserva le tabelle `templates`, `demos`, `links` se sono ancora funzionali.
   - Valuta se unificare gli schemi (attuale differenza tra `infra/migrations` e `db/schema.sql`).

## 4. UI / Tema

- Mantieni la palette definita in `src/themes` (variabili CSS come `--text`, `--muted`, `--accent`).
- Conserva i layout principali (`BaseLayout`, `PostLayout`) e la logica per `<head>`/SEO.
- Riporta gli stessi font (`@fontsource` importati nel `src/styles/global.css` o entry Tailwind).
- Riprendi le classi Tailwind personalizzate (config aziendale in `tailwind.config.cjs`).
- Verifica che gli script AOS e i componenti React (video player, slider) siano elencati e copiati.

## 5. Pages Functions e middleware

Copiando il repo, avrai già le funzioni API (`functions/api/*`). Per la nuova implementazione devi:

- Conservare la struttura dei file e le route (es. `functions/api/templates.ts`).
- Riportare il middleware globale `_middleware.ts` girando a vuote (solo CORS/basic logging) finché non riscrivi l’autenticazione.
- Documentare i binding Cloudflare usati: `SESSION` (KV), eventuali D1, env key per Resend, Turnstile.

## 6. Autenticazione e invio email: da riprogettare

Nel nuovo repository **non** copiare il codice corrente di login e contact. Limiti principali:

- Flusso di login locale/Pages non coerente, cookie non affidabili.
- Gestione form contatti legata a logiche da rivedere (rate limit, validazioni, Resend).

### Proposta di riprogettazione (solo linee guida)

1. **Login admin**
   - Decidi se usare un provider esterno (Clerk, Auth0) o un login proprietario.
   - Se proprietario: definisci uno schema credenziali (es. D1 `admin_users`), usa hashing provato (bcrypt/argon2) e sessioni firmate.
   - Scrivi doc e test dedicati per garantire funzionalità su Cloudflare Pages + anteprima locale.

2. **Form contatti**
   - Isola la logica in una funzione dedicata con validazioni (Turnstile, rate limit per IP).
   - Spedizione email tramite Resend o alternativa; gestisci errori e logging.
   - Prevedi test/manuale su ambienti diversi.

Nel documento di progettazione del nuovo login/email evita di riusare concetti o frammenti attuali: descrivi requisiti, flusso, pseudocodice.

## 7. Procedura consigliata per il “nuovo repo”

1. **Clona l’attuale repo solo come riferimento** (non riutilizzare commit).
2. **Crea cartella nuova** `copycodeai-v2` e inizializza `npm create astro@latest`.
3. **Porta file statici e pagine** (step 3 sopra) testando ogni pagina dopo il porting.
4. **Reimporta layout/tema** e verifica che Tailwind funzioni.
5. **Aggiungi Scripts/function API** copiando i file necessari e adattando i binding.
6. **Documento design auth/email** prima di scrivere codice.
7. **Implementa nuova auth** seguendo il design approvato.
8. **Scrivi test manuali/automatici** (login, logout, accesso admin, invio form).
9. **Configura ambienti** su Pages (secrets, D1/KV).
10. **Aggiorna documentazione** (`README`, `docs/`) con nuova configurazione.

## 8. Checklist finale per il nuovo progetto

- [ ] Pagine pubbliche replicate e testate (desktop/mobile).
- [ ] Contenuti Sanity collegati e query funzionanti.
- [ ] Funzioni API di servizio (ping/templates) operative.
- [ ] Plan dettagliato per nuova auth e contact (senza codice legacy).
- [ ] Test login/logout (manuali + eventuali e2e) superati.
- [ ] Docs aggiornati con istruzioni per dev e deploy.
- [ ] Secrets e environment configurati (Resend, Turnstile, future credenziali login).

Quando questa checklist è completa, puoi deprecare il vecchio repository e utilizzare il nuovo come base. Dopo la migrazione, elimina accessi e segreti non più usati per sicurezza.
