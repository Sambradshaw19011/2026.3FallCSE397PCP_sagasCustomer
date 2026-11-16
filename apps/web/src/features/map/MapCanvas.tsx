'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef } from 'react';
import type { SiteListEntry } from './MapUnavailable';

function toneForLabel(label: string): string {
  switch (label) {
    case 'Thin record':
      return '#f59e0b';
    case 'Growing record':
      return '#fbbf24';
    case 'Well documented':
      return '#10b981';
    case 'Richly documented':
      return '#2563eb';
    default:
      return '#6b7280';
  }
}

export function MapCanvas({ sites, token }: { sites: SiteListEntry[]; token: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = token;

    const validSites = sites.filter(({ site }) => {
      const [longitude, latitude] = site.coordinates;
      return (
        Number.isFinite(longitude) && Number.isFinite(latitude)
        && longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90
      );
    });
    if (validSites.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    validSites.forEach(({ site }) => bounds.extend(site.coordinates));

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds,
      fitBoundsOptions: { padding: 48, maxZoom: 16 },
    });

    validSites.forEach(({ site, integrityLabel }) => {
      const markerEl = document.createElement('button');
      markerEl.type = 'button';
      markerEl.title = `${site.name}: ${integrityLabel}`;
      markerEl.setAttribute('aria-label', `View ${site.name}`);
      markerEl.style.width = '14px';
      markerEl.style.height = '14px';
      markerEl.style.border = '2px solid rgba(255,255,255,0.9)';
      markerEl.style.borderRadius = '9999px';
      markerEl.style.background = toneForLabel(integrityLabel);
      markerEl.style.boxShadow = '0 1px 2px rgba(15, 23, 42, 0.35)';
      markerEl.style.cursor = 'pointer';
      markerEl.style.display = 'block';
      markerEl.addEventListener('click', () => {
        window.location.assign(`/sites/${site.slug}`);
      });

      new mapboxgl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat(site.coordinates)
        .addTo(map);
    });

    return () => map.remove();
  }, [sites, token]);

  return (
    <div className="overflow-hidden rounded border border-neutral-300 bg-neutral-50">
      <div ref={containerRef} aria-label="Map showing places" className="h-[320px] w-full" />
    </div>
  );
}
