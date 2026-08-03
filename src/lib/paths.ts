// BASE_URL is '/' in local dev and '/finlayson-holdings/' on GitHub Pages
// (driven by BASE_PATH in CI — see .github/workflows/deploy.yml). Route all
// internal hrefs and asset URLs through these helpers so the site works both
// on the project-pages subpath and on a future custom domain.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const withBase = (path: string) => `${base}${path}`;

export const localePath = (locale: string, path = '') => withBase(`/${locale}${path}`);
