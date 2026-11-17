import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export interface UseProjectScopedStateOptions<T> {
  projectId: string | undefined;
  readValue: (projectId: string | undefined) => T;
  writeValue: (projectId: string | undefined, value: T) => void;
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Manages UI state scoped to `projectId` without cross-project clobbering.
 *
 * Unlike paired read/write `useEffect` hooks (where a write effect with `[state, projectId]`
 * can run BEFORE the read effect and overwrite Project B's persisted value with Project A's stale
 * state), this hook resolves the target project's persisted value synchronously during render and
 * writes updates immediately for the owning `projectId`.
 */
export function useProjectScopedState<T>({
  projectId,
  readValue,
  writeValue,
  isEqual = Object.is,
}: UseProjectScopedStateOptions<T>): [T, Dispatch<SetStateAction<T>>] {
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;
  const readValueRef = useRef(readValue);
  readValueRef.current = readValue;
  const writeValueRef = useRef(writeValue);
  writeValueRef.current = writeValue;
  const isEqualRef = useRef(isEqual);
  isEqualRef.current = isEqual;

  const [entry, setEntry] = useState<{ projectId: string | undefined; value: T }>(() => ({
    projectId,
    value: readValue(projectId),
  }));

  const currentValue =
    entry.projectId === projectId ? entry.value : readValue(projectId);

  if (entry.projectId !== projectId) {
    setEntry({ projectId, value: currentValue });
  }

  const setProjectScopedValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const activePid = projectIdRef.current;
    setEntry((prev) => {
      const baseValue =
        prev.projectId === activePid ? prev.value : readValueRef.current(activePid);
      const nextValue =
        typeof action === 'function'
          ? (action as (prevState: T) => T)(baseValue)
          : action;
      if (prev.projectId === activePid && isEqualRef.current(prev.value, nextValue)) {
        return prev;
      }
      writeValueRef.current(activePid, nextValue);
      return { projectId: activePid, value: nextValue };
    });
  }, []);

  return [currentValue, setProjectScopedValue];
}
