CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  project_name TEXT NOT NULL,
  subdomain TEXT NOT NULL,
  protected INTEGER NOT NULL DEFAULT 1,
  access_app_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS demos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_slug TEXT NOT NULL,
  client_email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY(template_slug) REFERENCES templates(slug)
);
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_slug TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  FOREIGN KEY(template_slug) REFERENCES templates(slug)
);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_demos_template ON demos(template_slug);
CREATE INDEX IF NOT EXISTS idx_demos_expires ON demos(expires_at);
