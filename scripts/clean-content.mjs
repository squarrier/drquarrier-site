// Generates clean Astro content-collection pages from the Content-Drafts markdown.
// Strips draft frontmatter + "Editing notes / Open items / Suggested next" sections,
// writes new frontmatter matching src/content.config.ts.
// Run from the site/ dir:  node scripts/clean-content.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRAFTS = resolve(__dirname, '../../Content-Drafts');
const OUT = resolve(__dirname, '../src/content/pages');
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { src: 'holep.md', slug: 'holep', schemaType: 'MedicalProcedure',
    title: 'HoLEP — What It Is, How It Works, What to Expect',
    description: "What Holmium Laser Enucleation of the Prostate (HoLEP) is, who it's for, and what to expect before, during, and after surgery." },
  { src: 'why-holep.md', slug: 'why-holep', schemaType: 'Article',
    title: 'How HoLEP Compares to Other BPH Procedures',
    description: 'An evidence-based comparison of HoLEP with TURP, Rezum, UroLift, Aquablation, GreenLight, iTind, and PAE — with primary-source citations.' },
  { src: 'early-intervention.md', slug: 'early-intervention', schemaType: 'Article',
    title: 'Why Not Wait? The Case for Earlier BPH Surgery',
    description: 'The published case for treating BPH sooner rather than later: symptom progression, medication limits, and the cost of delayed surgery.' },
  { src: 'recovery.md', slug: 'recovery', schemaType: 'Article',
    title: 'HoLEP Recovery — What to Expect, Week by Week',
    description: 'What HoLEP recovery actually looks like, week by week — catheter, bleeding, continence, sexual function, and when to call.' },
  { src: 'research.md', slug: 'research', schemaType: 'Article',
    title: 'Research',
    description: "Dr. Quarrier's research on teaching HoLEP, patient-reported outcomes, equity in BPH care, and improving the patient experience." },
  { src: 'faq.md', slug: 'faq', schemaType: 'FAQPage',
    title: 'Frequently Asked Questions about HoLEP',
    description: 'Common questions about HoLEP — candidacy, recovery, sexual function, blood thinners, prostate size, and more.' },
  { src: 'fellowship.md', slug: 'fellowship', schemaType: 'Article',
    title: 'Fellowship and Visiting-Surgeon Opportunities',
    description: 'Endourology fellowship and HoLEP training opportunities with Dr. Scott Quarrier at UR Medicine.' },
  { src: 'already-in-retention.md', slug: 'already-in-retention', schemaType: 'MedicalCondition',
    title: 'Already in Urinary Retention?',
    description: 'In urinary retention or catheter-dependent? Why HoLEP is often the right answer, and how to be seen at UR Medicine Urology.' },
  { src: 'traveling-to-urmc.md', slug: 'traveling-to-urmc', schemaType: 'Article',
    title: 'Traveling to UR Medicine for HoLEP',
    description: 'Logistics for patients traveling to Rochester for HoLEP — visit timeline, what to bring, where to stay, and follow-up at a distance.' },
  { src: 'for-providers.md', slug: 'for-providers', schemaType: 'Article',
    title: 'For Referring Providers',
    description: 'How to refer a BPH or kidney-stone patient to Dr. Scott Quarrier at UR Medicine Urology.' },
];

const CUT = [
  '\n## Editing notes',
  '\n## Open items',
  '\n## Suggested next',
  '\n---\n\n## Editing notes',
];

function stripFrontmatter(text) {
  if (text.startsWith('---')) {
    const end = text.indexOf('\n---', 3);
    if (end !== -1) return text.slice(text.indexOf('\n', end + 1) + 1);
  }
  return text;
}

function cutEditingNotes(body) {
  let idx = body.length;
  for (const m of CUT) {
    const i = body.indexOf(m);
    if (i !== -1 && i < idx) idx = i;
  }
  let out = body.slice(0, idx).trimEnd();
  // drop a trailing horizontal rule left dangling before the cut
  out = out.replace(/\n+---\s*$/, '');
  return out.trimEnd() + '\n';
}

function esc(s) { return s.replace(/"/g, '\\"'); }

for (const p of PAGES) {
  const raw = readFileSync(resolve(DRAFTS, p.src), 'utf8');
  const body = cutEditingNotes(stripFrontmatter(raw)).trimStart();
  const fm = [
    '---',
    `title: "${esc(p.title)}"`,
    `description: "${esc(p.description)}"`,
    `schemaType: ${p.schemaType}`,
    '---',
    '',
  ].join('\n');
  writeFileSync(resolve(OUT, `${p.slug}.md`), fm + body, 'utf8');
  console.log(`wrote ${p.slug}.md (${body.length} chars)`);
}
console.log('done');
