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
// Add future jargon here.
const GLOSS = [
  {
    id: 'morcellation',
    pattern: '(?<![\\w-])morcellat\\w*',
    gloss: '(the freed tissue is broken into tiny fragments and suctioned out through the scope)',
  },
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
