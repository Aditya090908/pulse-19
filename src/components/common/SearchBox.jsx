import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Biohazard, Globe, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { navigate } from '../../hooks/useHashRoute.js';
import useClickOutside from '../../hooks/useClickOutside.js';
import { RISK_LEVELS } from '../../utils/risk.js';

export default function SearchBox() {
  const { countryRows = [], diseaseRows = [], selectCountry } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();
  useClickOutside(wrapRef, () => setOpen(false), open);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const countries = countryRows
      .filter((r) => r.name.toLowerCase().includes(q) || r.iso.toLowerCase() === q)
      .slice(0, 5)
      .map((r) => ({ key: `c-${r.code}`, kind: 'country', label: r.name, sub: `${r.region}, ${RISK_LEVELS[r.risk.level].label.toLowerCase()} risk`, code: r.code }));
    const diseases = diseaseRows
      .filter((d) => d.disease.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((d) => ({ key: `d-${d.id}`, kind: 'disease', label: d.disease.name, sub: `${d.countries} countries, ${d.disease.transmission.toLowerCase()}`, id: d.id }));
    return [...countries, ...diseases];
  }, [query, countryRows, diseaseRows]);

  useEffect(() => setActive(0), [query]);

  // "/" focuses search from anywhere outside a text field.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const choose = (result) => {
    if (!result) return;
    if (result.kind === 'country') selectCountry(result.code);
    else navigate(`/diseases/${result.id}`);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-label="Search countries and diseases"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search countries or diseases"
        className="w-full rounded-lg border border-line-strong bg-panel-2 py-2 pl-9 pr-8 text-sm text-ink placeholder:text-ink-faint hover:border-accent/50 focus:border-accent"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line-strong px-1.5 text-[11px] text-ink-faint sm:block">/</kbd>
      {showList && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 z-40 mt-2 max-h-80 animate-fade-in overflow-y-auto rounded-xl border border-line-strong bg-panel-2 p-1 shadow-panel">
          {results.length === 0 && <li className="px-3 py-3 text-sm text-ink-muted">No countries or diseases match “{query}”.</li>}
          {results.map((r, i) => {
            const Icon = r.kind === 'country' ? Globe : Biohazard;
            return (
              <li
                key={r.key}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left ${i === active ? 'bg-panel-3' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
                  <span className="block truncate text-xs text-ink-muted">{r.sub}</span>
                </span>
                <span className="ml-auto text-xs text-ink-faint">{r.kind === 'country' ? 'Country' : 'Disease'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
