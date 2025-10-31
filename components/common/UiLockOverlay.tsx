"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useUiLock } from "@/lib/ui-lock";

/**
 * Capa global de carga que aparece cuando hay "locks" activos.
 * - Fade in/out con CSS.
 * - Pequeño delay para evitar parpadeos en navegaciones muy rápidas.
 */
export default function UiLockOverlay({
  delay = 120, // ms antes de mostrar (evita flashes)
  zIndex = 1200, // debajo del Modal de MUI (1300), encima del resto
}: {
  delay?: number;
  zIndex?: number;
}) {
  const { locked } = useUiLock();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let t: any;
    if (locked) {
      t = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(t);
  }, [locked, delay]);

  return (
    <Box
      aria-hidden={visible ? "false" : "true"}
      sx={{
        pointerEvents: visible ? "auto" : "none",
        position: "fixed",
        inset: 0,
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 180ms ease",
        // capa semitransparente + blur
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {/* loader + pequeño pulso */}
      <Box
        sx={{
          position: "relative",
          width: 72,
          height: 72,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "9999px",
            animation: "pulse 1200ms ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(216,27,156,0.5)" },
              "70%": { boxShadow: "0 0 0 12px rgba(216,27,156,0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(216,27,156,0)" },
            },
          }}
        />
        <CircularProgress thickness={4} />
      </Box>
    </Box>
  );
}
