import type {StructureResolver} from 'sanity/structure';

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('CopyCodeAI · Contenuti')
    .items([
      S.listItem()
        .title('Web Design Projects')
        .schemaType('project')
        .child(S.documentTypeList('project').title('Web Design Projects')),
      S.listItem()
        .title('AI Solutions')
        .schemaType('aiSolution')
        .child(S.documentTypeList('aiSolution').title('AI Solutions')),
      S.listItem()
        .title('Writing')
        .schemaType('post')
        .child(S.documentTypeList('post').title('Writing')),
    ]);
