// copycodeart/studio/schemas/post.ts

export default {
  name: 'post',
  title: 'Articolo del Blog',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule: any) => Rule.required().error('Il titolo è obbligatorio.'),
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
      name: 'publishedAt',
      title: 'Data di Pubblicazione',
      type: 'datetime',
    },
    {
      name: 'body',
      title: 'Contenuto dell\'articolo',
      type: 'blockContent', // Useremo un tipo speciale per il testo ricco
    },
    // Aggiungeremo l'immagine di copertina e l'autore dopo
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
}
