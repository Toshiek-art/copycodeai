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
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Titolo alternativo per i meta tag (max ~60 caratteri).',
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Riassunto per meta description e social preview (max ~160 caratteri).',
      validation: (Rule: any) => Rule.max(200),
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
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Immagine per anteprima social (altrimenti usa quella principale).',
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
