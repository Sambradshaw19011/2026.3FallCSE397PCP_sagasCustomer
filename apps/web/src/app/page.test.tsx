import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sagas/read-model', async () => {
  const { loadSiteState, loadWorld } = await import('@sagas/fixtures/acceptance');
  return {
    getSiteState: (slug: string, stateId: string) => loadSiteState(slug, stateId),
    listSites: () => loadWorld('t3').map((state) => state.site),
  };
});

import Page from './page';

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', undefined));
afterEach(() => vi.unstubAllEnvs());

describe('home', () => {
  it('shows all six places without a token and leaves the article off home', () => {
    const html = renderToStaticMarkup(<Page />);
    const list = /<nav aria-label="Places in the archive">([\s\S]*?)<\/nav>/.exec(html)?.[1];

    expect(html).not.toContain('The shop on the corner');
    expect(html).not.toContain('The shop stood');
    expect(list?.match(/<li\b/g)).toHaveLength(6);
    expect(list).toContain('href="/sites/corner-shop"');
    expect(html).toContain('Filter places');
  });
});
