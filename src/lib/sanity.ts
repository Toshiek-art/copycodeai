// src/lib/sanity.ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  // usa le env se presenti, altrimenti i tuoi valori attuali
  projectId: import.meta.env.SANITY_PROJECT_ID ?? "1avzsmsi",
  dataset: import.meta.env.SANITY_DATASET ?? "production",
  apiVersion: import.meta.env.SANITY_API_VERSION ?? "2024-04-01",
  // dev: dati freschi; prod: edge cache
  useCdn: import.meta.env.DEV ? false : true,
  // se in futuro ti serve token per draft/privati: SANITY_READ_TOKEN
  token: import.meta.env.SANITY_READ_TOKEN,
  stega: {
    enabled: false,
  },
});

