import { useCallback, useRef, useState } from 'react';
import useClickOutside from '../../hooks/useClickOutside.js';

/**
 * Anchored popover. `trigger` is called with { open, toggle } and returns the button.
 * `children` can be a node or a function receiving { close }.
 */
export default function Popover({ trigger, children, align = 'right', panelClassName = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={`absolute z-40 mt-2 animate-fade-in rounded-xl border border-line-strong bg-panel-2 shadow-panel ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
