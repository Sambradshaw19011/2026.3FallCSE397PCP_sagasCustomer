import type { IntegrityScore, Site } from '@sagas/contracts';
import { bandFor } from '@/features/site/IntegrityBadge';
import { MapCanvas } from './MapCanvas';
import { MapUnavailable } from './MapUnavailable';
import type { SiteListEntry } from './MapUnavailable';

/** One site and its integrity; pages read the data, components take props. */
export function summariseSite(site: Site, integrity: IntegrityScore): SiteListEntry {
  const band = bandFor(integrity.overall);
  return { site, integrityLabel: band.label, integrityInvitation: band.invitation };
}

export function MapView({ sites: summaries }: { sites: SiteListEntry[] }) {
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
