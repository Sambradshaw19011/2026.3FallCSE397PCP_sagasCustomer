import { describe, expect, it } from 'vitest';
import { filterSites } from './MapUnavailable';
import type { SiteListEntry } from './MapUnavailable';

const sites: SiteListEntry[] = [
  {
    site: {
      id: '1',
      slug: 'corner-shop',
      name: 'Corner Shop',
      aka: ['the fronton', 'old market'],
      coordinates: [-122.4194, 37.7749],
      address: '72 Market Street',
      city: 'San Francisco',
      coordinatePrecision: 'approximate',
    },
    integrityLabel: 'Thin record',
    integrityInvitation: 'A few claims, mostly from one person. More would help.',
  },
  {
    site: {
      id: '2',
      slug: 'river-works',
      name: 'River Works',
      aka: ['the quay'],
      coordinates: [-122.4313, 37.8038],
      address: '18 Water Lane',
      city: 'Oakland',
      coordinatePrecision: 'approximate',
    },
    integrityLabel: 'Well documented',
    integrityInvitation: 'Corroborated across contributors and source types.',
  },
];

describe('filterSites', () => {
  it('returns all entries when the query is blank', () => {
    expect(filterSites('', sites)).toHaveLength(2);
  });

  it('matches by site name, aka and address without regard to letter case', () => {
    expect(filterSites('fronton', sites).map(({ site }) => site.slug)).toEqual(['corner-shop']);
    expect(filterSites('water lane', sites).map(({ site }) => site.slug)).toEqual(['river-works']);
    expect(filterSites('san francisco', sites).map(({ site }) => site.slug)).toEqual(['corner-shop']);
  });
});
