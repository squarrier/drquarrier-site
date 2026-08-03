// Site-wide constants — single source of truth for identity, contact, nav.

export const SITE = {
  domain: 'https://drquarrier.com',
  name: 'Scott Quarrier, MD, MPH',
  shortName: 'Dr. Quarrier',
  tagline: 'Fellowship-trained HoLEP surgeon at the University of Rochester',
  practice: 'UR Medicine Urology',
  phone: '(585) 275-2838',
  phoneHref: 'tel:5852752838',
  clinicAddress: '158 Sawgrass Drive, Suite 230, Rochester, NY',
  hospitals: 'Strong Memorial Hospital and Highland Hospital',
  orcid: 'https://orcid.org/0000-0002-2546-5264',
  scholar: 'https://scholar.google.com/citations?user=DX-5X7MAAAAJ',
  urmcProfile: 'https://www.urmc.rochester.edu/people/112360785-scott-quarrier',
  urmcUrology: 'https://www.urmc.rochester.edu/urology',
  enucleate: 'https://enucleate.org/',
  bphVideo: 'https://www.youtube.com/watch?v=rJXvKQtFYxc',
  bphVideoId: 'rJXvKQtFYxc',
  rating: { value: '4.7', count: '703' },
};

// Main (top) navigation — patient pages + Fellowship (per Scott: other MDs use it).
export const MAIN_NAV: { label: string; href: string }[] = [
  { label: 'HoLEP', href: '/holep/' },
  { label: 'Why HoLEP', href: '/why-holep/' },
  { label: 'Why Not Wait', href: '/early-intervention/' },
  { label: 'Recovery', href: '/recovery/' },
  { label: 'Symptom Check', href: '/symptom-check/' },
  { label: 'Research', href: '/research/' },
  { label: 'FAQ', href: '/faq/' },
  { label: 'Teaching', href: '/fellowship/' },
];

// Footer secondary links (entry/logistics/colleague pages not in the top nav).
export const FOOTER_NAV: { label: string; href: string }[] = [
  { label: 'HoLEP and prostate cancer', href: '/holep-and-prostate-cancer/' },
  { label: 'Already in retention?', href: '/already-in-retention/' },
  { label: 'Traveling to Rochester', href: '/traveling-to-urmc/' },
  { label: 'Refer a patient', href: '/for-providers/' },
];
