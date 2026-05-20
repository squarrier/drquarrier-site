import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Deep-dive content pages, authored as markdown in src/content/pages/.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Short label for breadcrumbs/headers if different from title.
    heading: z.string().optional(),
    // Schema.org type for the page's primary entity.
    schemaType: z.enum(['Article', 'MedicalProcedure', 'MedicalCondition', 'FAQPage']).default('Article'),
  }),
});

export const collections = { pages };
