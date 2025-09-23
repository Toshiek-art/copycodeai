// src/lib/sanity.ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: "1avzsmsi",
  dataset: "production",
  apiVersion: "2024-04-01", // usa una data recente
  useCdn: false, // `false` per lo sviluppo, `true` per la produzione
  stega: {
    // Opzionale: configurazione per le anteprime in tempo reale
    enabled: false, 
  },
});
