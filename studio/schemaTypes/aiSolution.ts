// copycodeart/studio/schemaTypes/aiSolution.ts
export default {
  name: 'aiSolution',
  title: 'Soluzione AI per il Business',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titolo della Soluzione/Caso Studio',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'solutionType',
      title: 'Tipo di Soluzione',
      type: 'string',
      options: {
        list: [
          { title: 'Caso Studio (Prompt Engineering)', value: 'case-study' },
          { title: 'GPT Personalizzato', value: 'gpt' },
          { title: 'Immagini per Brand', value: 'visual' },
        ],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'summary',
      title: 'Sommario (una frase che riassume il beneficio)',
      type: 'string',
    },
    {
      name: 'challenge',
      title: 'La Sfida / Il Problema del Cliente',
      type: 'text',
      rows: 3,
    },
    {
      name: 'solution',
      title: 'La Mia Soluzione Implementata',
      type: 'blockContent',
    },
    {
      name: 'mainImage',
      title: 'Immagine Rappresentativa',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'gallery',
      title: 'Galleria di Esempi (per "Immagini per Brand")',
      type: 'array',
      of: [{ 
        type: 'image',
        options: { hotspot: true },
        fields: [
          {
            name: 'caption',
            type: 'string',
            title: 'Didascalia (es. contesto d\'uso)',
          }
        ]
      }],
      // Mostra questo campo solo se il tipo è "Immagini per Brand"
      hidden: ({ parent }: { parent: { solutionType: string } }) => parent?.solutionType !== 'visual',
    },
    {
      name: 'projectUrl',
      title: 'URL Esterno (es. per provare il GPT)',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'solutionType',
      media: 'mainImage',
    },
  },
}
