CREATE TABLE IF NOT EXISTS templates (
  slug TEXT PRIMARY KEY,                 -- es: "manus-design-notes"
  title TEXT NOT NULL,                   -- titolo umano
  body TEXT,                             -- testo o JSON serializzato
  meta TEXT,                             -- JSON serializzato per tag, autore, ecc.
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS demos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_slug TEXT NOT NULL,           -- FK -> templates.slug
  payload TEXT NOT NULL,                 -- input/parametri demo (JSON serializzato)
  result  TEXT,                          -- output demo (opzionale, JSON/text)
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (template_slug) REFERENCES templates(slug) ON DELETE CASCADE
);



-- Indici utili
CREATE INDEX IF NOT EXISTS idx_templates_created_at 
  ON templates(created_at);

CREATE INDEX IF NOT EXISTS idx_demos_template_created 
  ON demos(template_slug, created_at);
