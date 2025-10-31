"use client";
import { createContext, useContext, useMemo, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

type Ctx = {
  locked: boolean;
  lock: (reason?: string) => number; // devuelve id de lock
  unlock: (id: number) => void; // libera lock concreto
  clear: () => void; // libera todos (por seguridad)
};

const UiLockCtx = createContext<Ctx>({
  locked: false,
  lock: () => 0,
  unlock: () => {},
  clear: () => {},
});

export function UiLockProvider({ children }: { children: React.ReactNode }) {
  const [locks, setLocks] = useState<{ id: number; reason?: string }[]>([]);

  const value = useMemo<Ctx>(
    () => ({
      locked: locks.length > 0,
      lock: (reason?: string) => {
        const id = Date.now() + Math.random();
        setLocks((l) => [...l, { id, reason }]);
        return id;
      },
      unlock: (id: number) => setLocks((l) => l.filter((x) => x.id !== id)),
      clear: () => setLocks([]),
    }),
    [locks]
  );

  return (
    <UiLockCtx.Provider value={value}>
      {children}
      <Backdrop
        open={locks.length > 0}
        sx={{
          zIndex: (t) => t.zIndex.modal + 20,
          backdropFilter: "blur(2px)",
          bgcolor: "rgba(0,0,0,.35)",
        }}
      >
        <CircularProgress />
      </Backdrop>
    </UiLockCtx.Provider>
  );
}

export function useUiLock() {
  return useContext(UiLockCtx);
}
