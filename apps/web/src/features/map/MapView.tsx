import type { Site } from '@sagas/contracts';
import { getSiteState } from '@sagas/read-model';
import { bandFor } from '@/features/site/IntegrityBadge';
import { MapCanvas } from './MapCanvas';
import { MapUnavailable } from './MapUnavailable';
import type { SiteListEntry } from './MapUnavailable';

function summariseSites(sites: Site[]): SiteListEntry[] {
  return sites.map((site) => {
    const state = getSiteState(site.slug, 't3');
    const band = bandFor(state.integrity.overall);

    return {
      site,
      integrityLabel: band.label,
      integrityInvitation: band.invitation,
    };
  });
}

/**
 * The server reads fixture data and passes only the resulting site summaries
 * to the interactive map and searchable list.
 */
export function MapView({ sites }: { sites: Site[] }) {
  const summaries = summariseSites(sites);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) return <MapUnavailable sites={summaries} />;
  if (summaries.length === 0) {
    return <p className="text-sm text-neutral-600">No places in the archive yet.</p>;
  }

  return (
    <div className="space-y-4">
      <MapCanvas sites={summaries} token={token} />
      <MapUnavailable sites={summaries} />
    </div>
  );
}
