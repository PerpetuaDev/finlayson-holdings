// Global site configuration.
// showSecurity is the single switch (README: State Management) that shows or
// hides the Security pre-announcement in all four places at once:
// companies band 03, the group structure diagram box, and both footers.
export const site = {
  showSecurity: true,
  // Keep false while the site lives on the github.io URL; flip to true at
  // custom-domain launch so the temporary URL never gets indexed first.
  indexable: false,
  urls: {
    mdmc: 'https://mdmc.co',
    perpetua: 'https://perpetua.studio',
  },
  // DO Function relay (relay/ in this repo) → Mailgun → contact@finlaysonholdings.com
  contactEndpoint:
    'https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-e1f1c95d-6eee-4feb-a650-53f4c9448f2c/finlayson/contact',
} as const;

export type Locale = 'en' | 'ja';
export const locales: Locale[] = ['en', 'ja'];
