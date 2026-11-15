import { useCallback, useState } from 'react';
import { readStorage, writeStorage } from '../services/storage.js';

/** useState that mirrors its value to localStorage (safely). */
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}
