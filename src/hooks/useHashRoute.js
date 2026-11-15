import { useEffect, useState } from 'react';

export const ROUTES = ['overview', 'map', 'analytics', 'countries', 'diseases', 'alerts'];

function parse(hash) {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || 'overview', param: parts[1] || null };
}

export function navigate(path) {
  const next = path.startsWith('/') ? path : `/${path}`;
  window.location.hash = next;
}

/** Minimal hash router: #/overview, #/diseases/cholera, ... */
export default function useHashRoute() {
  const [route, setRoute] = useState(() => parse(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parse(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
