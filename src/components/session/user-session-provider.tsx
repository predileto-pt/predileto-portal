"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createSessionStore,
  type SessionStore,
} from "@/lib/session/store";
import {
  hasCapability,
} from "@/lib/session/capabilities";
import type {
  Capability,
  Kind,
} from "@/lib/session/types";
import {
  TOAST_COPY,
  type SessionApiError,
} from "@/lib/session/errors";

export interface UseUserSession {
  kind: Kind;
  userId: string | null;
  capabilities: ReadonlyArray<Capability>;
  can: (cap: Capability) => boolean;
  hydrated: boolean;
}

const StoreContext = createContext<SessionStore | null>(null);

/** Internal: hook the slice modules use to read the store reference. */
export function useSessionStore(): SessionStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error(
      "useSessionStore() must be used inside <UserSessionProvider>",
    );
  }
  return store;
}

export function useUserSession(): UseUserSession {
  const store = useSessionStore();
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const can = useCallback(
    (cap: Capability) => hasCapability(snapshot.capabilities, cap),
    [snapshot.capabilities],
  );
  return {
    kind: snapshot.kind,
    userId: snapshot.userId,
    capabilities: snapshot.capabilities,
    can,
    hydrated: snapshot.hydrated,
  };
}

interface ProviderProps {
  children: React.ReactNode;
}

interface ToastState {
  id: number;
  copy: string;
}

export function UserSessionProvider({ children }: ProviderProps) {
  // Build the store once. Stable identity across re-renders.
  const [store] = useState<SessionStore>(() => createSessionStore());
  const [toast, setToast] = useState<ToastState | null>(null);
  // Debounce per error code: don't show the same toast more than once per 5s.
  const lastShownAtRef = useRef<Map<string, number>>(new Map());
  const toastIdRef = useRef(0);

  const showToast = useCallback((key: string, copy: string) => {
    const now = Date.now();
    const last = lastShownAtRef.current.get(key) ?? 0;
    if (now - last < 5000) return;
    lastShownAtRef.current.set(key, now);
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, copy });
  }, []);

  useEffect(() => {
    store.setErrorNotifier((err: SessionApiError, action) => {
      const code = "code" in err ? err.code : "TRANSPORT";
      // Special-case write-side SESSION_INVALID: the store has already kicked
      // off /init; copy is the "renewed" message rather than the generic one.
      if (action === "write" && err.kind === "invalid") {
        showToast("SESSION_RENEWED", TOAST_COPY.RENEWED);
        return;
      }
      const copy =
        code in TOAST_COPY
          ? TOAST_COPY[code as keyof typeof TOAST_COPY]
          : TOAST_COPY.TRANSPORT;
      showToast(code, copy);
    });
    return () => store.setErrorNotifier(null);
  }, [store, showToast]);

  // Lazy mint on first mount. Fire-and-forget — errors are routed to the toast.
  useEffect(() => {
    void store.bootstrap();
  }, [store]);

  const value = useMemo(() => store, [store]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <SessionToast
        toast={toast}
        onDismiss={() => setToast(null)}
      />
    </StoreContext.Provider>
  );
}

function SessionToast({
  toast,
  onDismiss,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const handle = setTimeout(onDismiss, 6000);
    return () => clearTimeout(handle);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-ink text-paper text-sm shadow-lg px-4 py-3 flex items-start gap-3"
    >
      <span className="flex-1 leading-snug">{toast.copy}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar"
        className="text-paper/60 hover:text-paper cursor-pointer shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
