// in: copycodeart/studio/sanity.config.ts

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes' // <-- L'UNICO IMPORT RELATIVO AGLI SCHEMI
import StudioLogo from './components/StudioLogo'
import StudioNavbar from './components/StudioNavbar'
import {deskStructure} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'CopyCodeAI Studio',

  projectId: '1avzsmsi',
  dataset: 'production',

  plugins: [
    structureTool({structure: deskStructure}),
    visionTool(),
  ],

  schema: {
    types: schemaTypes, // <-- Qui usa l'array importato
  },

  studio: {
    components: {
      logo: StudioLogo,
      navbar: StudioNavbar,
    },
  },
})
