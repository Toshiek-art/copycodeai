// in: copycodeart/studio/schemaTypes/index.ts
import blockContent from './blockContent'
import post from './post'
import project from './project' // Questo è per il Web Design
import aiSolution from './aiSolution' // 1. Importa il nostro nuovo schema unificato

// 2. Assicurati che l'array sia pulito e contenga solo questi
export const schemaTypes = [post, project, aiSolution, blockContent] 
