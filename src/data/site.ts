// Global site configuration.
// showSecurity is the single switch (README: State Management) that shows or
// hides the Security pre-announcement in all four places at once:
// companies band 03, the group structure diagram box, and both footers.
export const site = {
  showSecurity: true,
  urls: {
    mdmc: 'https://mdmc.co',
    perpetua: 'https://perpetua.studio',
  },
} as const;

export type Locale = 'en' | 'ja';
export const locales: Locale[] = ['en', 'ja'];
