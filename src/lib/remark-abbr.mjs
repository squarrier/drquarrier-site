// Build-time remark plugin: make medical jargon patient-friendly on first use.
//
// Two mechanisms:
//  1. ACRONYMS (MAP): the first bare use of each acronym per page becomes
//     "expansion (ACRONYM)"; later uses stay short.
//  2. GLOSSES (GLOSS): non-acronym jargon (e.g. "morcellated") gets a short
//     plain-language parenthetical on its first use per page.
//
// Rules that keep it safe:
//  - If the page already spells out an acronym in body prose, that acronym is left
//    alone — no double-expansion. (Headings and footnote/citation text are ignored
//    when detecting this, since full terms appear there incidentally.)
//  - A gloss is skipped if the term is already immediately followed by a parenthetical.
//  - Only the first standalone occurrence in body text is touched; later ones stay as-is.
//  - Headings, links, code, TABLE cells, and footnotes/citations are skipped entirely
//    (the /why-holep comparison table keeps its short labels; a one-line key under the
//    table defines them).
//  - HoLEP is intentionally excluded from MAP — it's the site's brand term, spelled out
//    by hand.

const MAP = {
  ThuLEP: 'thulium laser enucleation of the prostate',
  TURP: 'transurethral resection of the prostate',
  LUTS: 'lower urinary tract symptoms',
  BPH: 'benign prostatic hyperplasia',
  PVP: 'photoselective vaporization',
  PAE: 'prostatic artery embolization',
  PUL: 'prostatic urethral lift',
  TRUS: 'transrectal ultrasound',
  PSA: 'prostate-specific antigen',
  IPSS: 'International Prostate Symptom Score',
  ED: 'erectile dysfunction',
};

// Plain-language glosses for non-acronym jargon. The first use per page gets the
// parenthetical. The `pattern` matches the whole word family (e.g. morcellate/-ed/-ion/-or).
// A gloss is skipped if the term is already immediately followed by "(" (author already
// explained it inline). Add future jargon here — one entry each.
const GLOSS = [
  // --- procedure / anatomy ---
  { id: 'morcellation', pattern: '(?<![\\w-])morcellat\\w*',
    gloss: '(the freed tissue is broken into tiny fragments and suctioned out through the scope)' },
  { id: 'enucleation', pattern: '(?<![\\w-])(?<!laser )(?<!Laser )enucleat\\w*',
    gloss: "(the prostate's inner core is removed whole, leaving the outer shell intact)" },
  { id: 'adenoma', pattern: '(?<![\\w-])adenoma\\w*',
    gloss: '(the inner part of the prostate that enlarges with age and squeezes the urethra)' },
  { id: 'median-lobe', pattern: '(?<![\\w-])median lobe',
    gloss: '(a portion of the prostate that bulges up into the bladder and can block flow)' },
  { id: 'resectoscope', pattern: '(?<![\\w-])resectoscope\\w*',
    gloss: '(a slim instrument passed through the urethra that the surgeon works through)' },
  { id: 'nitinol', pattern: '(?<![\\w-])nitinol',
    gloss: '(a flexible, springy metal alloy)' },
  // --- symptoms / measurements ---
  { id: 'post-void-residual', pattern: '(?<![\\w-])post-void residual',
    gloss: '(the amount of urine left in the bladder after you finish urinating)' },
  { id: 'qmax', pattern: '(?<![\\w-])Qmax',
    gloss: '(the peak urine-flow rate, a standard measure of how obstructed the stream is)' },
  { id: 'uroflow', pattern: '(?<![\\w-])uroflow\\w*',
    gloss: '(a simple test that measures how fast your urine flows)' },
  { id: 'hematuria', pattern: '(?<![\\w-])hematuria',
    gloss: '(blood in the urine)' },
  { id: 'bladder-outlet-obstruction', pattern: '(?<![\\w-])bladder outlet obstruction',
    gloss: "(blockage of the bladder's outflow by the enlarged prostate)" },
  { id: 'urinary-retention', pattern: '(?<![\\w-])urinary retention',
    gloss: '(being unable to empty the bladder on your own)' },
  { id: 'hydronephrosis', pattern: '(?<![\\w-])hydronephrosis',
    gloss: '(urine backing up and swelling the kidney)' },
  { id: 'stricture', pattern: '(?<![\\w-])strictur\\w*',
    gloss: '(a scar-tissue narrowing of the urethra)' },
  // --- devices / equipment ---
  { id: 'catheter', pattern: '(?<![\\w-])catheter[\\w-]*',
    gloss: '(a thin, flexible tube that drains urine from the bladder)' },
  // --- medications ---
  { id: 'anticoagulant', pattern: '(?<![\\w-])anticoagula\\w*',
    gloss: '(blood-thinning medication)' },
  { id: 'antiplatelet', pattern: '(?<![\\w-])antiplatelet\\w*',
    gloss: '(a type of blood thinner, such as aspirin or clopidogrel)' },
  { id: 'alpha-blocker', pattern: '(?<![\\w-])alpha-blocker\\w*',
    gloss: '(a common prostate medication that relaxes the bladder neck, e.g. tamsulosin)' },
  { id: 'five-ari', pattern: '(?<![\\w-])5-ARIs?',
    gloss: '(a prostate medication that slowly shrinks the gland, e.g. finasteride)' },
  // --- conditions / other ---
  { id: 'comorbidity', pattern: '(?<![\\w-])comorbidit\\w*',
    gloss: '(other ongoing medical conditions)' },
  { id: 'orthostatic-hypotension', pattern: '(?<![\\w-])orthostatic hypotension',
    gloss: '(a drop in blood pressure on standing that causes light-headedness)' },
  { id: 'gynecomastia', pattern: '(?<![\\w-])gynecomastia',
    gloss: '(enlargement of breast tissue)' },
  { id: 'occult', pattern: '(?<![\\w-])occult',
    gloss: '(hidden, not previously detected)' },
  { id: 'prostatectomy', pattern: '(?<![\\w-])prostatectom\\w*',
    gloss: '(surgical removal of prostate tissue, traditionally through an incision)' },
  { id: 'ablation', pattern: '(?<![\\w-])ablat\\w*',
    gloss: '(destroying tissue in place rather than removing it)' },
  // --- research methodology (for the comparison/research pages) ---
  { id: 'propensity', pattern: '(?<![\\w-])propensity[\\w-]*',
    gloss: '(a statistical method for fairly comparing similar patients)' },
  { id: 'hazard-ratio', pattern: '(?<![\\w-])hazard ratio',
    gloss: '(a measure of how much a treatment lowers risk over time)' },
  { id: 'kaplan-meier', pattern: '(?<![\\w-])Kaplan-Meier',
    gloss: '(a method that accounts for how long each patient was followed)' },
  { id: 'meta-analysis', pattern: '(?<![\\w-])(network )?meta-analys\\w*',
    gloss: '(a study that statistically pools results from many earlier studies)' },
  { id: 'sham', pattern: '(?<![\\w-])sham(?![\\w-])',
    gloss: '(a placebo procedure used for comparison in a trial)' },
  { id: 'perioperative', pattern: '(?<![\\w-])perioperativ\\w*',
    gloss: '(in the period right around surgery)' },
];

const SKIP_TYPES = new Set([
  'heading', 'link', 'code', 'inlineCode',
  'table', 'tableRow', 'tableCell',
  'footnoteDefinition', 'footnoteReference',
]);

// In Pass 1 we look for terms the author already spelled out in *body prose* — so we
// ignore headings and footnote/citation text, where full terms appear incidentally
// (e.g. journal-article titles) and would wrongly suppress a first-use expansion.
const DETECT_SKIP = new Set(['heading', 'footnoteDefinition']);

export default function remarkAbbr() {
  return (tree) => {
    // Pass 1: gather body-prose text so we can detect acronyms the author already expanded.
    let allText = '';
    (function collect(n) {
      if (DETECT_SKIP.has(n.type)) return;
      if (typeof n.value === 'string') allText += ' ' + n.value;
      if (n.children) n.children.forEach(collect);
    })(tree);

    const done = new Set();
    for (const acr of Object.keys(MAP)) {
      if (allText.toLowerCase().includes(MAP[acr].toLowerCase())) done.add(acr);
    }
    const glossed = new Set();

    // Pass 2: expand acronyms and add glosses in the first eligible body text node.
    (function walk(node, skip) {
      if (!node.children) return;
      for (const child of node.children) {
        const childSkip = skip || SKIP_TYPES.has(child.type);
        if (child.type === 'text' && !skip) {
          child.value = expand(child.value);
        }
        if (child.children) walk(child, childSkip);
      }
    })(tree, false);

    function expand(text) {
      for (const acr of Object.keys(MAP)) {
        if (done.has(acr)) continue;
        const re = new RegExp('(?<![\\(\\w-])' + acr + '(?![\\w-])');
        const m = re.exec(text);
        if (m) {
          let phrase = MAP[acr];
          // Capitalize the expansion when the acronym opens a sentence/block, so the
          // paragraph doesn't start with a stray lowercase word. We treat "start of this
          // text node followed by prose" or "after sentence-ending punctuation" as a
          // sentence start; a bare acronym that is the whole node (e.g. a bold fragment
          // mid-sentence) leaves the lowercase form.
          const before = text.slice(0, m.index).replace(/\s+$/, '');
          const after = text.slice(m.index + acr.length);
          const opensSentence = (before === '' || /[.!?:]$/.test(before)) && /^[\s,;]*[a-z]/.test(after);
          if (opensSentence) phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
          text = text.slice(0, m.index) + phrase + ' (' + acr + ')' + after;
          done.add(acr);
        }
      }
      for (const g of GLOSS) {
        if (glossed.has(g.id)) continue;
        const gre = new RegExp(g.pattern, 'i');
        const gm = gre.exec(text);
        if (gm) {
          const end = gm.index + gm[0].length;
          const tail = text.slice(end);
          // If the author already put a parenthetical right after the term, leave it.
          if (/^\s*\(/.test(tail)) { glossed.add(g.id); continue; }
          text = text.slice(0, end) + ' ' + g.gloss + tail;
          glossed.add(g.id);
        }
      }
      return text;
    }
  };
}
