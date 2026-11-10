'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Site } from '@sagas/contracts';

export interface SiteListEntry {
  site: Site;
  integrityLabel: string;
  integrityInvitation: string;
}

export function filterSites(query: string, sites: SiteListEntry[]) {
  const needle = query.trim().toLowerCase();

  if (!needle) return sites;

  return sites.filter(({ site, integrityLabel }) => {
    const searchable = [
      site.name,
      site.address,
      site.city,
      ...site.aka,
      integrityLabel,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(needle);
  });
}

export function MapUnavailable({ sites }: { sites: SiteListEntry[] }) {
  const [query, setQuery] = useState('');
  const visibleSites = useMemo(() => filterSites(query, sites), [query, sites]);

  if (sites.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        No places in the archive yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700" htmlFor="site-search">
        Filter places
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, aka, or address"
        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      />

      {visibleSites.length === 0 ? (
        <p className="text-sm text-neutral-600">No places match that search.</p>
      ) : (
        <nav aria-label="Places in the archive">
          <ul className="divide-y divide-neutral-200">
            {visibleSites.map(({ site, integrityLabel, integrityInvitation }) => (
              <li key={site.id} className="py-3">
                <Link
                  href={`/sites/${site.slug}`}
                  className="group block rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                >
                  <span className="text-sm font-medium text-neutral-900 group-hover:underline">
                    {site.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-600">
                    {site.address}, {site.city}
                  </span>
                  {site.aka.length > 0 && (
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      also called {site.aka.slice(0, 3).join(', ')}
                    </span>
                  )}
                  <span className="mt-1 block text-xs font-medium text-neutral-700">
                    {integrityLabel}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-neutral-500">
                    {integrityInvitation}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
