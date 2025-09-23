export type Writing = {
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  status: 'published' | 'draft' | 'archived';
  visible: boolean;
  navVisible?: boolean;
  pullquote?: string;
  readingTime?: string;
};

export const writings: Writing[] = [
  {
    slug: 'manus-design-notes',
    title: 'Design notes per Manus AI',
    excerpt:
      'Parametri e regole per generare pagine coerenti con il nostro stile e il nostro flusso.',
    category: 'Notes',
    status: 'published',
    visible: true,
    pullquote:
      'Le macchine non pensano: compongono. Noi decidiamo la metrica.',
    readingTime: '4 min'
  },
  {
    slug: 'access-diary',
    title: 'Zero Trust Access – Diario di bordo',
    excerpt:
      'Problema, ipotesi, fix: come abbiamo chiuso /admin in meno di un’ora.',
    category: 'Build Log',
    status: 'published',
    visible: true,
    readingTime: '3 min'
  }
];
