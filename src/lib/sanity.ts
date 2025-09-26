// src/lib/sanity.ts
import { createClient } from "@sanity/client";

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
};

const defaultUseCdn = toBoolean(import.meta.env.SANITY_USE_CDN, false);

export const sanityClient = createClient({
  // usa le env se presenti, altrimenti i tuoi valori attuali
  projectId: import.meta.env.SANITY_PROJECT_ID ?? "1avzsmsi",
  dataset: import.meta.env.SANITY_DATASET ?? "production",
  apiVersion: import.meta.env.SANITY_API_VERSION ?? "2024-04-01",
  // di default evitiamo l'API CDN per compatibilità con Cloudflare Pages; abilita via SANITY_USE_CDN=true se preferisci la cache edge
  useCdn: defaultUseCdn,
  // se in futuro ti serve token per draft/privati: SANITY_READ_TOKEN
  token: import.meta.env.SANITY_READ_TOKEN,
  stega: {
    enabled: false,
  },
});
