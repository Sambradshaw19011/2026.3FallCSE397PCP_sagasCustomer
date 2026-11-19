'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address?: string;
  place_formatted?: string;
}

export interface MapSearchResult {
  label: string;
  coordinates: [number, number];
}

export function MapSearch({
  token,
  onSelect,
}: {
  token: string;
  onSelect: (result: MapSearchResult) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const session = useRef<string>(undefined);
  const retrieval = useRef<AbortController>(undefined);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => () => retrieval.current?.abort(), []);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) return;

    const controller = new AbortController();
    async function suggest() {
      try {
        session.current ??= crypto.randomUUID();
        const params = new URLSearchParams({
          q: text,
          access_token: token,
          session_token: session.current,
          limit: '5',
        });
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error('Search failed');
        const data = (await response.json()) as { suggestions: Suggestion[] };
        if (controller.signal.aborted) return;
        setSuggestions(data.suggestions);
        setStatus(
          data.suggestions.length
            ? `${data.suggestions.length} suggestions. Tab to choose one.`
            : 'No addresses or places found.',
        );
      } catch {
        if (!controller.signal.aborted)
          setStatus('Map search is unavailable. Try again.');
      }
    }
    const timer = window.setTimeout(() => void suggest(), 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, token]);

  async function select(suggestion: Suggestion) {
    const sessionToken = session.current;
    if (!sessionToken) return;

    session.current = undefined;
    const controller = new AbortController();
    retrieval.current = controller;
    setQuery('');
    setSuggestions([]);
    setStatus('Finding the selected location…');
    input.current?.focus();

    const params = new URLSearchParams({
      access_token: token,
      session_token: sessionToken,
    });
    const endpoint = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(suggestion.mapbox_id)}`;
    try {
      const response = await fetch(`${endpoint}?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Location lookup failed');
      const data = (await response.json()) as {
        features: { geometry: { coordinates: number[] } }[];
      };
      if (controller.signal.aborted) return;
      const [lng, lat] = data.features[0]?.geometry.coordinates ?? [];
      if (
        lng === undefined ||
        lat === undefined ||
        !Number.isFinite(lng) ||
        !Number.isFinite(lat) ||
        Math.abs(lng) > 180 ||
        Math.abs(lat) > 90
      ) {
        throw new Error('Location coordinates unavailable');
      }
      onSelect({ label: suggestion.name, coordinates: [lng, lat] });
      setStatus(`Pin dropped at ${suggestion.name}.`);
    } catch {
      if (!controller.signal.aborted)
        setStatus('Could not find that location. Search again.');
    }
  }

  function updateQuery(value: string) {
    retrieval.current?.abort();
    if (!value.trim()) session.current = undefined;
    setSuggestions([]);
    setStatus('');
    setQuery(value);
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-700"
      >
        Find an address or place on the map
      </label>
      <input
        ref={input}
        id={id}
        type="search"
        autoComplete="off"
        maxLength={256}
        value={query}
        onChange={(event) => updateQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && query) {
            event.preventDefault();
            updateQuery('');
          }
        }}
        className="w-full rounded border border-neutral-500 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-neutral-700"
      />
      <p
        role="status"
        className={status ? 'text-sm text-neutral-700' : 'sr-only'}
      >
        {status}
      </p>
      {suggestions.length > 0 && (
        <ul
          aria-label="Map search suggestions"
          className="divide-y rounded border border-neutral-300"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.mapbox_id}>
              <button
                type="button"
                onClick={() => void select(suggestion)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-700"
              >
                <span className="font-medium">{suggestion.name}</span>
                <span className="block text-xs text-neutral-600">
                  {suggestion.full_address ?? suggestion.place_formatted}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
