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
    const lockId = lock("open-product"); // 👈 MISMO id

    const maybe = (router as any).prefetch?.(href);
    if (maybe && typeof (maybe as any)?.finally === "function") {
      (maybe as Promise<void>).finally(() => {
        router.push(href, { scroll: false });
      });
    } else {
      setTimeout(() => router.push(href, { scroll: false }), 80);
    }

    setTimeout(() => unlock(lockId), 1200);
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
