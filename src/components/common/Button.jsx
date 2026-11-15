const VARIANTS = {
  primary: 'bg-accent text-canvas hover:bg-accent/90 border border-transparent font-semibold',
  secondary: 'border border-line-strong bg-panel-2 text-ink hover:border-accent/60 hover:text-accent-fg',
  ghost: 'border border-transparent text-ink-muted hover:bg-panel-3 hover:text-ink',
};

export default function Button({ variant = 'secondary', icon: Icon, children, className = '', size = 'md', ...rest }) {
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${pad} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />}
      {children}
    </button>
  );
}
