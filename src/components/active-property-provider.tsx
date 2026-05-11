"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Tracks which result card is currently most-visible in the viewport.
 * Cards self-register via `useRegisterActiveProperty(id)`. A single
 * IntersectionObserver watches all registered nodes and the provider
 * emits the id of the one with the largest intersection ratio above
 * `MIN_RATIO`. Falls back to `null` when nothing meets the threshold.
 */

const MIN_RATIO = 0.45;
const THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

type Registry = Map<
  string,
  { element: Element; ratio: number }
>;

interface ActivePropertyContextValue {
  activeId: string | null;
  register: (id: string, element: Element) => () => void;
}

const ActivePropertyContext = createContext<ActivePropertyContextValue>({
  activeId: null,
  register: () => () => {},
});

export function ActivePropertyProvider({
  children,
  onChange,
}: {
  children: React.ReactNode;
  onChange?: (id: string | null) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const registryRef = useRef<Registry>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const idByElementRef = useRef<WeakMap<Element, string>>(new WeakMap());
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Recompute the most-visible id from the registry.
  const recompute = useCallback(() => {
    let bestId: string | null = null;
    let bestRatio = MIN_RATIO;
    registryRef.current.forEach((entry, id) => {
      if (entry.ratio > bestRatio) {
        bestRatio = entry.ratio;
        bestId = id;
      }
    });
    setActiveId((prev) => {
      if (prev === bestId) return prev;
      onChangeRef.current?.(bestId);
      return bestId;
    });
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByElementRef.current.get(entry.target);
          if (!id) continue;
          const existing = registryRef.current.get(id);
          if (!existing) continue;
          existing.ratio = entry.intersectionRatio;
        }
        recompute();
      },
      { threshold: THRESHOLDS, rootMargin: "-10% 0px -25% 0px" },
    );
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [recompute]);

  const register = useCallback(
    (id: string, element: Element) => {
      registryRef.current.set(id, { element, ratio: 0 });
      idByElementRef.current.set(element, id);
      observerRef.current?.observe(element);
      return () => {
        observerRef.current?.unobserve(element);
        registryRef.current.delete(id);
        idByElementRef.current.delete(element);
        // If the unregistered id was active, recompute.
        recompute();
      };
    },
    [recompute],
  );

  const value = useMemo<ActivePropertyContextValue>(
    () => ({ activeId, register }),
    [activeId, register],
  );

  return (
    <ActivePropertyContext.Provider value={value}>
      {children}
    </ActivePropertyContext.Provider>
  );
}

/** Register a DOM element as a "card" candidate for active-property tracking. */
export function useRegisterActiveProperty(
  id: string,
): React.RefCallback<HTMLElement> {
  const { register } = useContext(ActivePropertyContext);
  const unregisterRef = useRef<(() => void) | null>(null);
  return useCallback(
    (node: HTMLElement | null) => {
      // Tear down any previous registration (id changed or node detached).
      unregisterRef.current?.();
      unregisterRef.current = null;
      if (node) {
        unregisterRef.current = register(id, node);
      }
    },
    [id, register],
  );
}

export function useActivePropertyId(): string | null {
  return useContext(ActivePropertyContext).activeId;
}
