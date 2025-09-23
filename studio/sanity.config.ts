// in: copycodeart/studio/sanity.config.ts

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes' // <-- L'UNICO IMPORT RELATIVO AGLI SCHEMI

export default defineConfig({
  name: 'default',
  title: 'CopyCodeArt Portfolio',

  projectId: '1avzsmsi',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes, // <-- Qui usa l'array importato
  },
})
