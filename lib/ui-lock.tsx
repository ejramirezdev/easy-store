// lib/ui-lock.ts
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type LockId = number | string;

type UiLockCtx = {
  // abre un lock, opcionalmente con etiqueta legible
  lock: (label?: string) => LockId;
  // cierra un lock por id (acepta number o string)
  unlock: (id: LockId) => void;
  // cierra todos los locks activos
  unlockAll: () => void;
  // función para consultar si hay lock activo
  isLocked: () => boolean;
  // boolean “derivado” para usar directo en JSX
  locked: boolean;
};

const Ctx = createContext<UiLockCtx | null>(null);

export function UiLockProvider({ children }: { children: React.ReactNode }) {
  const seq = useRef(0);
  const locks = useRef<Set<string>>(new Set());
  // fuerza re-render del provider cuando cambian locks
  const [version, setVersion] = useState(0);

  const norm = (id: LockId) => String(id);

  const applyOverflow = () => {
    if (typeof document !== "undefined") {
      document.documentElement.style.overflow =
        locks.current.size > 0 ? "hidden" : "";
    }
  };

  const lock = useCallback((label?: string): LockId => {
    const id = label ?? ++seq.current;
    locks.current.add(norm(id));
    applyOverflow();
    setVersion((v) => v + 1);
    return id;
  }, []);

  const unlock = useCallback((id: LockId) => {
    locks.current.delete(norm(id));
    applyOverflow();
    setVersion((v) => v + 1);
  }, []);

  const unlockAll = useCallback(() => {
    locks.current.clear();
    applyOverflow();
    setVersion((v) => v + 1);
  }, []);

  const isLocked = useCallback(() => locks.current.size > 0, []);

  const value = useMemo<UiLockCtx>(
    () => ({
      lock,
      unlock,
      unlockAll,
      isLocked,
      locked: locks.current.size > 0,
    }),
    // cuando version cambia, recalculamos locked
    [lock, unlock, unlockAll, isLocked, version]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUiLock() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // fallback súper seguro si el Provider no está montado
    return {
      lock: () => 0 as LockId,
      unlock: () => {},
      unlockAll: () => {},
      isLocked: () => false,
      locked: false,
    } as UiLockCtx;
  }
  return ctx;
}
