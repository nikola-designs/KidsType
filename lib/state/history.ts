import { useCallback, useMemo, useState } from "react";

type HistoryStore<T> = {
  past: T[];
  present: T;
  future: T[];
};

type StateUpdater<T> = T | ((current: T) => T);

const MAX_HISTORY = 80;

export const useHistoryState = <T,>(initialState: T) => {
  const [history, setHistory] = useState<HistoryStore<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const set = useCallback((next: StateUpdater<T>) => {
    setHistory((current) => {
      const nextPresent =
        typeof next === "function" ? (next as (value: T) => T)(current.present) : next;

      if (Object.is(nextPresent, current.present)) {
        return current;
      }

      const trimmedPast = [...current.past, current.present].slice(-MAX_HISTORY);

      return {
        past: trimmedPast,
        present: nextPresent,
        future: []
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setHistory({
      past: [],
      present: next,
      future: []
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      if (!current.past.length) {
        return current;
      }

      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      if (!current.future.length) {
        return current;
      }

      const next = current.future[0];
      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: next,
        future: current.future.slice(1)
      };
    });
  }, []);

  const controls = useMemo(
    () => ({
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0
    }),
    [history.future.length, history.past.length]
  );

  return {
    present: history.present,
    set,
    reset,
    undo,
    redo,
    ...controls
  };
};
