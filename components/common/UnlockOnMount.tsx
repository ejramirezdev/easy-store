"use client";

import { useEffect } from "react";
import { useUiLock } from "@/lib/ui-lock";

export default function UnlockOnMount({ id }: { id?: number | string }) {
  const { unlock, unlockAll } = useUiLock();

  useEffect(() => {
    try {
      if (id !== undefined) {
        unlock(id);
      } else {
        unlockAll();
      }
    } catch {
      // safety: no romper
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
