export default function Logo({ className = '' }) {
  return (
    <a href="#/overview" className={`flex items-center gap-2.5 rounded-lg ${className}`} aria-label="PULSE-19 home">
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="fill-panel" />
        <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="6.25" className="stroke-line-strong" strokeWidth="1.5" />
        <path d="M5 17.5h5.5l3-8.5 5 15 3.2-9.5 1.8 2.5H27" className="stroke-accent" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-base font-semibold tracking-tight text-ink">PULSE-19</span>
    </a>
  );
}
