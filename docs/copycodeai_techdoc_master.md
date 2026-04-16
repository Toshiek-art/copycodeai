# CopyCodeAI — Techdoc Master

## Scopo del documento
Questo documento raccoglie le decisioni tecniche e architetturali già emerse per `copycodeai.online`, in modo da avere una fonte unica, coerente e operativa per l’implementazione.

Serve a:
- evitare di rifare audit già chiusi
- mantenere allineate struttura, contenuti, SEO e conversione
- eseguire gli sprint in un ordine corretto
- conservare motivazioni e vincoli delle scelte fatte

---

## Stato attuale del sito

### Stack e architettura
- Sito static-first basato su Astro.
- Layout globale in `src/layouts/BaseLayout.astro`.
- Routing file-based in `src/pages`.
- Piccolo layer server-side già presente tramite Cloudflare Pages Functions in `functions/`.
- Tracking base via GA4, caricato solo dopo consenso cookie.
- Nessun backend persistente per lead/contact attualmente integrato nel sito pubblico.
- Contact strategy attuale: `mailto:` + Calendly.

### Route pubbliche principali
- `/`
- `/services`
- `/contact`
- `/compliance-ready-landing`
- `/ai-feature-integration`
- `/eaa-structural-hardening`
- `/work`
- `/work/[slug]`
- `/guides/`
- `/guides/gdpr-ai-startup/`
- `/guides/eaa-startup-websites/`
- `/guides/data-flow-ai-feature/`
- `/privacy`
- `/accessibility`

### Route non primarie / legacy / tecniche
- `/blueprint` → alias tecnico legacy verso `/#blueprint`
- `/writing` → redirect legacy verso `/guides/`
- `/404` → utility page, non da indicizzare
- `/api/*` → route tecniche, non da promuovere né indicizzare

---

## Decisioni architetturali bloccate

### 1. `/blueprint`
Decisione: mantenerlo come alias tecnico legacy non indicizzabile.

Regole:
- resta accessibile
- non deve avere canonical
- deve usare `robots="noindex, follow"`
- i link interni principali devono puntare a `/#blueprint`, non a `/blueprint`

Motivazione:
- mantiene compatibilità con link vecchi
- evita di aprire ora una nuova pagina canonica autonoma
- è la scelta più coerente con la home attuale

### 2. Sitemap
Decisione: mantenerla manuale per ora.

Regole:
- includere solo URL canonici pubblici HTML
- non includere `/404`
- non includere `/blueprint`
- non includere `/writing`
- non includere `/api/*`
- aggiornarla nello stesso PR in cui si aggiungono o rimuovono route pubbliche

Motivazione:
- il sito è ancora piccolo
- non esiste ancora una content architecture abbastanza complessa da giustificare automazione immediata
- automatizzarla ora introdurrebbe più complessità che valore

### 3. Canonical e robots
Decisione: introdurre `robots` esplicito nel layout, evitando l’hardcode unico globale.

Regole:
- pagine canoniche pubbliche: `index, follow` + canonical presente
- pagine utility/legacy: `noindex, follow` + canonical assente
- endpoint API: `X-Robots-Tag: noindex, nofollow`

Motivazione:
- risolve i casi `/404` e `/blueprint`
- mantiene il refactor minimo
- evita di introdurre tipizzazioni premature tipo `pageType`

### 4. Guides
Decisione: le guide restano pagine `.astro` standalone.

Regole:
- niente migrazione immediata a MDX/content collections
- niente `GuideArticleLayout` adesso, salvo necessità futura
- usare una sorgente dati unica in `src/data/guides.ts`
- introdurre componenti riusabili leggeri

Motivazione:
- il numero di guide attuale non giustifica una migrazione grossa
- serve ordine e riuso, non overengineering

### 5. FAQ
Decisione: usare un sistema FAQ riusabile senza creare ora una pagina `/faq` centrale.

Regole:
- pattern visibile: `details/summary`
- niente accordion JS
- sorgente dati unica in `src/data/faq.ts`
- usare FAQ prima nelle offer page
- riuso nelle guide solo quando aggiunge valore reale

Motivazione:
- le FAQ esistono già nelle offer page
- la pagina centrale ora sarebbe un ramo in più senza sufficiente massa editoriale

### 6. Conversione
Decisione: introdurre form HTML nativi + Cloudflare Functions.

Regole:
- niente form library pesanti
- due flussi iniziali:
  - download guida con email
  - consultation/contact qualificato
- Contact diventa il centro intake
- mailto e Calendly restano fallback secondari
- separare parsing/validation, provider adapter, endpoint orchestration e UI

Motivazione:
- coerente con stack static-first
- basso costo operativo
- compatibile con piano gratuito di Cloudflare Functions

### 7. Provider esterno
Decisione: progettare il sistema in modo compatibile con Brevo, senza vincolarlo subito.

Regole:
- adapter separato in `functions/_utils/lead-provider.js`
- possibile uso di `LEAD_PROVIDER=mock|brevo`
- nessuna logica provider nei componenti UI
- nessuna logica provider hardcoded negli endpoint di orchestrazione

Motivazione:
- evita lock-in
- permette sviluppo locale e progressivo

### 8. `llms.txt`
Decisione: farlo, ma finalizzarlo dopo la pulizia strutturale e l’assestamento delle Guides.

Regole:
- non trattarlo come sitemap duplicata
- aggiornarlo solo quando cambiano contenuti pillar, gerarchia o struttura semantica
- usarlo come mappa curatoriale del sito pubblico

Motivazione:
- ha senso quando la struttura è più stabile
- non deve fotografare un sito in pieno refactor

---

## Sprint plan generale

### Ordine corretto di esecuzione
1. Sprint 1 — Pulizia strutturale e SEO base
2. Sprint Guides
3. Sprint FAQ
4. Sprint Conversione
5. Finalizzazione `llms.txt` v1

---

## Sprint 1 — Pulizia strutturale e SEO base

### Obiettivi
- supporto `robots` esplicito in `BaseLayout`
- `/404` noindex e senza canonical
- `/blueprint` noindex e senza canonical
- `X-Robots-Tag` su `/api/*`
- `Disallow: /api/` in `robots.txt`
- sitemap manuale completata con le guide mancanti
- link interni principali spostati da `/blueprint` a `/#blueprint`

### Commit plan
1. `chore(seo): add robots override support to BaseLayout`
2. `chore(seo): noindex legacy utility pages`
3. `chore(seo): protect API routes from indexing`
4. `fix(seo): complete manual sitemap coverage`
5. `chore(content): repoint blueprint links to home anchor`

### Criteri di accettazione
- `/404` ha `noindex, follow` e nessun canonical
- `/blueprint` ha `noindex, follow` e nessun canonical
- `/blueprint` resta accessibile come alias legacy
- `robots.txt` contiene `Disallow: /api/`
- endpoint `/api/*` emettono `X-Robots-Tag`
- sitemap contiene tutte le guide pubbliche reali
- sitemap non contiene route tecniche o legacy
- i link interni importanti puntano a `/#blueprint`

---

## Sprint Guides

### Obiettivi
#### P0
- centralizzare i metadati delle guide in `src/data/guides.ts`
- eliminare publish gating client-side in `/guides/`
- creare componenti riusabili per card, header, CTA finale, related service
- aggiungere `Article` e `BreadcrumbList`

#### P1
- aggiungere `GuideRelatedGuides`
- mostrare `publishAt` / `updatedAt` in modo coerente

#### P2
- preparare `pdfUrl: null` per il futuro layer download
- valutare `GuideArticleLayout` solo se necessario più avanti

### Architettura scelta
- guide `.astro` standalone
- registry unico in `src/data/guides.ts`
- componenti leggeri e riusabili
- niente MDX/content collections ora
- niente `GuideArticleLayout` ora

### Componenti previsti
- `src/components/guides/GuideCard.astro`
- `src/components/guides/GuideHeader.astro`
- `src/components/guides/GuideCTA.astro`
- `src/components/guides/GuideRelatedService.astro`
- `src/components/guides/GuideRelatedGuides.astro`
- `src/components/seo/JsonLd.astro`

### Commit plan
1. `feat(guides): add shared guide registry`
2. `feat(guides): add reusable guide components and jsonld helper`
3. `refactor(guides): drive index page from registry`
4. `refactor(guides): migrate gdpr guide to shared structure`
5. `refactor(guides): migrate eaa guide to shared structure`
6. `refactor(guides): migrate ai data flow guide to shared structure`

### Criteri di accettazione
- `src/data/guides.ts` è la fonte unica dei metadati
- `/guides/` usa il registry, non array hardcoded
- non esiste più gating client-side nel browser
- le guide usano componenti riusabili
- CTA finali coerenti
- related service funzionante
- related guides funzionanti
- `Article` JSON-LD presente
- `BreadcrumbList` JSON-LD presente
- `pdfUrl: null` presente come placeholder

---

## Sprint FAQ

### Obiettivi
#### P0
- centralizzare il modello dati FAQ in `src/data/faq.ts`
- creare `FAQItem` e `FAQSection`
- migrare le FAQ hardcoded delle 3 offer page

#### P1
- aggiungere helper `FAQPage` JSON-LD
- preparare riuso futuro nelle guide

#### P2
- valutare `/faq` centrale solo se cresce la massa editoriale

### Architettura scelta
- pattern visibile: `details/summary`
- nessun accordion JS
- registry centrale in `src/data/faq.ts`
- helper schema in `src/lib/faq-schema.ts`
- serializer generico in `src/components/seo/JsonLd.astro`

### Componenti previsti
- `src/components/faq/FAQItem.astro`
- `src/components/faq/FAQSection.astro`
- `src/lib/faq-schema.ts`
- `src/components/seo/JsonLd.astro`

### Commit plan
1. `feat(faq): add shared faq registry`
2. `feat(faq): add reusable faq components and schema helper`
3. `refactor(faq): migrate compliance-ready landing faq`
4. `refactor(faq): migrate ai feature integration faq`
5. `refactor(faq): migrate eaa structural hardening faq`
6. `docs(faq): update support docs for reusable faq system`

### Criteri di accettazione
- dati FAQ centralizzati in `src/data/faq.ts`
- `FAQItem` e `FAQSection` esistono
- `faq-schema.ts` esiste
- `JsonLd.astro` esiste e resta generico
- le 3 offer page sono migrate
- nessuna FAQ hardcoded duplicata residua nelle offer page
- il markup visibile resta `details/summary`
- `FAQPage` deriva dagli stessi dati visibili
- nessuna pagina `/faq` centrale introdotta prematuramente

---

## Sprint Conversione

### Obiettivi
#### P0
- introdurre primitive form riusabili
- creare il flusso guide download → email → success state
- creare il flusso contact/consultation qualificato
- aggiungere endpoint Cloudflare Functions dedicati
- implementare validazione minima browser + server

#### P1
- aggiungere PDF pubblici per le guide
- aggiornare copy e documentazione stale

#### P2
- preparare adapter provider per Brevo senza lock-in

### Architettura scelta
- form HTML nativi
- validazione browser nativa
- submit POST a Cloudflare Functions
- validazione server minima
- redirect `303` con query state
- messaggi di successo/errore accessibili senza JS obbligatorio
- provider adapter separato
- Calendly resta esterno per ora

### Componenti previsti
- `src/components/forms/FormField.astro`
- `src/components/forms/CheckboxField.astro`
- `src/components/forms/FormStatus.astro`
- `src/components/forms/GuideDownloadForm.astro`
- `src/components/forms/ConsultationForm.astro`

### File server previsti
- `src/data/guide-downloads.ts`
- `functions/_utils/form-intake.js`
- `functions/_utils/lead-provider.js`
- `functions/api/forms/guide-download.js`
- `functions/api/forms/consultation.js`

### Commit plan
1. `feat(forms): add shared form primitives`
2. `feat(forms): add shared lead intake utils`
3. `feat(forms): add guide download registry and endpoint`
4. `feat(forms): add consultation endpoint and form`
5. `feat(forms): add guide download form`
6. `feat(forms): add consultation intake to contact page`
7. `chore(forms): add pdf download assets and docs updates`

### Criteri di accettazione
- form base riusabili presenti
- endpoint funzionanti
- validazione minima attiva
- guide con layer download coerente e non bloccante
- Contact come intake centrale
- fallback `mailto:` e Calendly mantenuti
- adapter provider separato
- messaggi success/error accessibili
- PDF pubblici disponibili
- README e privacy allineati se inclusi nello sprint

---

## Tracking e analytics

### Stato attuale
- GA4 presente ma solo come bootstrap dopo consenso.
- Nessun event layer custom del funnel ancora implementato.

### Direzione già emersa
- introdurre un helper leggero interno
- usare naming eventi semplice ma scalabile
- tracciare prima i passaggi chiave, poi la frizione

### Eventi prioritari futuri
#### Prima
- `guide_view`
- `cta_click`
- `guide_to_service_click`
- `guide_to_contact_click`
- `booking_click`
- `mailto_click`

#### Dopo
- `guide_download_click`
- `guide_download_submit`
- `contact_form_open`
- `contact_submit`
- `booking_open`

#### Più avanti
- `guide_scroll_*`
- `booking_success`
- `contact_success`
- `download_success`
- abandonment / error tracking più fine

Nota:
il tracking non va implementato prima della pulizia delle strutture che deve osservare.

---

## Regole per contenuto, download e conversione

### Guides
- il contenuto HTML resta sempre pubblico e leggibile
- il download è un bonus, non un gate
- il form download sta verso il fondo guida, non prima dell’articolo

### Consultation / contact
- Contact diventa intake primario
- `mailto:` e Calendly restano alternative secondarie
- nessuna sostituzione brusca del funnel esistente

### PDF
- i PDF vivono in `public/downloads/guides/`
- dopo submit riuscito: link diretto immediato + email con link come backup
- niente attachment pesanti nelle function

---

## Regole per provider e dati

### Adapter pattern
- il form non conosce il provider
- l’endpoint non conosce il provider in modo hardcoded
- l’adapter gestisce provider reali o mock

### Env vars previste
- `LEAD_PROVIDER=mock|brevo`
- `BREVO_API_KEY`
- `LEAD_INTERNAL_TO`
- `LEAD_FROM_EMAIL`

### Validazione server minima
- email valida
- phone valida in forma minima
- honeypot
- campi obbligatori
- controllo di `guideSlug`
- controllo di `returnTo`
- limiti di lunghezza

---

## Regole per `llms.txt`

### Cosa rappresenta
Una mappa compatta e curatoriale del sito pubblico.

### Quando finalizzarlo
Dopo:
- Sprint 1
- assestamento minimo del sistema Guides

### Cosa includere
- home
- services
- guides index
- work
- contact
- offer pages
- guide pillar
- privacy
- accessibility

### Cosa non fare
- non duplicare la sitemap
- non aggiornarlo a ogni guida settimanale
- non usarlo per route legacy o tecniche

---

## Cose esplicitamente rimandate
- automazione della sitemap
- migrazione a content collections / MDX
- `GuideArticleLayout`
- pagina `/faq` centrale
- sostituzione di Calendly con Cal.com
- n8n
- PocketBase
- Appwrite
- tracking funnel completo avanzato
- Turnstile / anti-spam più forte
- `llms-full.txt`

---

## Prossimi passi operativi
1. Eseguire Sprint 1.
2. Eseguire Sprint Guides.
3. Eseguire Sprint FAQ.
4. Eseguire Sprint Conversione.
5. Rivedere la struttura pubblica risultante.
6. Scrivere `llms.txt` v1 definitivo.
7. Solo dopo, decidere se passare a tracking avanzato e automazioni.

---

## Nota finale
Questo documento è da trattare come fonte di verità operativa fino a nuova revisione.
Le scelte qui raccolte sono state fatte per massimizzare:
- coerenza architetturale
- semplicità di implementazione
- compatibilità con costi minimi o nulli
- estendibilità senza refactor prematuri

