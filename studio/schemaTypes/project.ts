// copycodeart/studio/schemaTypes/project.ts
export default {
  name: 'project',
  title: 'Progetto Web Design',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Nome del Progetto',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Descrizione del Progetto',
      type: 'blockContent', // Riutilizziamo lo stesso tipo del blog!
    },
    {
      name: 'mainImage',
      title: 'Immagine Anteprima (Desktop)',
      type: 'image',
      options: {
        hotspot: true, // Permette di scegliere il punto focale dell'immagine
      },
    },
    {
      name: 'mobileImage',
      title: 'Immagine Anteprima (Mobile)',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'projectUrl',
      title: 'URL del Sito Demo',
      type: 'url',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
}

