// Reviewed against primary sources. These are citation-only findings, not imported
// prose or replacement geometries. Whole contradictory source rows are withheld;
// do not silently rename them or invent a corrected boundary/date interval.
export const identityReviews = [
  {
    indices: [13215],
    name: 'Federal Republic of Somalia',
    finding:
      'Source uses the federal-republic title over 1960–2023; the UN documents the new federal transition in 2012. The full source interval needs review.',
    references: [
      'https://www.un.org/sg/en/content/former-secretary-general/statements/2012-08-20/statement-attributable-the-spokesperson-for-the-secretary-general-somalia',
    ],
  },
  {
    indices: [13327],
    name: 'Kingdom of Bahrain',
    finding:
      'The 1973–2023 source interval predates the 2002 constitutional kingdom title. Do not present the full interval as a kingdom.',
    references: [
      'https://www.lloc.gov.bh/en/Legislation/id/ConstitMemo',
      'https://www.wipo.int/wipolex/en/legislation/details/19650',
    ],
  },
  {
    indices: [13315, 13324, 13400],
    name: 'Eswatini',
    finding:
      'The Eswatini name is backdated to 1969/1973/1976; the UN records the change from Swaziland in 2018. The separate 2024 row is not excluded by this finding.',
    references: [
      'https://www.un.org/en/about-us/member-states/eswatini',
      'https://www.un.int/eswatini/news/kingdom-eswatini-new-name-kingdom-swaziland',
    ],
  },
  {
    indices: [13496, 13539, 13565],
    name: 'Serbia-Montenegro',
    finding:
      'Source applies the Serbia-Montenegro name from 1992; the UN records the renaming of the Federal Republic of Yugoslavia in February 2003.',
    references: [
      'https://www.icty.org/en/about/what-former-yugoslavia',
      'https://digitallibrary.un.org/record/1129731?ln=en',
    ],
  },
  {
    indices: [13369, 13659],
    name: "People's Republic of Angola",
    finding:
      "The old People's Republic title is extended through 2023 and 2024. Contemporaneous Angolan UN statements in 2000 use Republic of Angola. Do not invent the exact name-change date from this evidence.",
    references: [
      'https://www.un.org/womenwatch/daw/followup/beijing%2B5stat/statments/angola5.htm',
      'https://digitallibrary.un.org/record/425318/files/S_2000_998-EN.pdf',
    ],
  },
  {
    indices: [13370, 13580],
    name: 'Libyan Arab Republic',
    finding:
      'The old Republic title is carried across 1976–2013. Contemporaneous 1977 UN treaty records use Libyan Arab Jamahiriya. The full title/period mapping needs review.',
    references: [
      'https://treaties.un.org/pages/showDetails.aspx?objid=08000002800f4be6',
      'https://www.un.org/unispal/document/auto-insert-204115/',
    ],
  },
];
export const identityReviewByIndex = new Map(
  identityReviews.flatMap((review) => review.indices.map((index) => [index, review])),
);
