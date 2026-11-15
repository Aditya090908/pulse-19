export default function Segmented({ options, value, onChange, label, size = 'md', className = '' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-lg border border-line bg-panel-2 p-0.5 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap rounded-md font-medium transition-colors ${pad} ${
              active ? 'bg-panel-3 text-accent-fg shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
