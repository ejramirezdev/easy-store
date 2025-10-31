"use client";

import { PropsWithChildren, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useUiLock } from "@/lib/ui-lock";

export default function ProductLinkCard({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const router = useRouter();
  const { lock, unlock } = useUiLock();

  const onClick = (e: MouseEvent) => {
    e.preventDefault();

    // 1) Bloquea la UI
    const id = lock("open-product");

    // 2) Intenta prefetch (en Next 16 devuelve void; en otros puede ser Promise)
    const maybe = (router as any).prefetch?.(href);

    // 3) Si devuelve promesa, espera al final; si no, empuja tras un breve delay
    if (maybe && typeof (maybe as any)?.finally === "function") {
      (maybe as Promise<void>).finally(() => {
        router.push(href, { scroll: false });
      });
    } else {
      // pequeño respiro para que el prefetch caliente el caché
      setTimeout(() => {
        router.push(href, { scroll: false });
      }, 80);
    }

    // 4) Safety unlock si algo quedara bloqueado (el modal también hace unlock al montar)
    setTimeout(() => unlock(id), 1200);
  };

  return (
    <a
      href={href}
      onClick={onClick}
      style={{ textDecoration: "none", display: "block" }}
    >
      {children}
    </a>
  );
}
