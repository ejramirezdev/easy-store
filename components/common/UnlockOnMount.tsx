"use client";
import { useEffect } from "react";
import { useUiLock } from "@/lib/ui-lock";

export default function UnlockOnMount() {
  const { clear } = useUiLock();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
