"use client";
import useSWR from "swr";
import { useState } from "react";

type CartProduct = {
  id: string;
  name: string;
  price: number; // ya numérico desde la API
  imageUrl?: string | null; // clave correcta
};

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
};

type CartResponse = {
  id: string;
  items: CartItem[];
  count: number;
  subtotal: number;
  // opcionales si luego añades cupones / envío / total:
  // discount?: number;
  // shipping?: number;
  // total?: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Action = "inc" | "dec" | "remove" | "add";

export function useCart() {
  const { data, error, isLoading, mutate } = useSWR<CartResponse>(
    "/api/cart",
    fetcher,
    { revalidateOnFocus: false }
  );

  // ---- loaders por botón ----
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const key = (productId: string, action: Action) => `${productId}:${action}`;
  const setP = (productId: string, action: Action, v: boolean) =>
    setPending((p) => ({ ...p, [key(productId, action)]: v }));

  function isPending(productId: string, action?: Action) {
    if (action) return !!pending[key(productId, action)];
    return (["inc", "dec", "remove", "add"] as Action[]).some(
      (a) => pending[key(productId, a)]
    );
  }

  // ---- acciones ----
  async function add(productId: string, quantity = 1) {
    setP(productId, "add", true);
    await mutate(
      async () => {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        return await fetcher("/api/cart");
      },
      { revalidate: false }
    );
    setP(productId, "add", false);
  }

  async function setQty(productId: string, quantity: number) {
    await mutate(
      async () => {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        return await fetcher("/api/cart");
      },
      { revalidate: false }
    );
  }

  async function remove(productId: string) {
    setP(productId, "remove", true);
    await mutate(
      async () => {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        return await fetcher("/api/cart");
      },
      { revalidate: false }
    );
    setP(productId, "remove", false);
  }

  // eliminar sin activar el loader de "Quitar"
  async function removeSilently(productId: string) {
    await mutate(
      async () => {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        return await fetcher("/api/cart");
      },
      { revalidate: false }
    );
  }

  async function inc(productId: string, currentQty: number) {
    setP(productId, "inc", true);
    await setQty(productId, currentQty + 1);
    setP(productId, "inc", false);
  }

  async function dec(productId: string, currentQty: number) {
    setP(productId, "dec", true);
    if (currentQty <= 1) {
      await removeSilently(productId);
    } else {
      await setQty(productId, currentQty - 1);
    }
    setP(productId, "dec", false);
  }

  // ---- NUEVO: refrescar desde fuera (p. ej., al aplicar/quitar cupón) ----
  async function refresh() {
    // sin argumentos => SWR revalida contra el fetcher
    await mutate();
  }

  return {
    cart: data,
    items: data?.items ?? [],
    count: data?.count ?? 0,
    subtotal: data?.subtotal ?? 0,
    isLoading,
    error,
    add,
    setQty,
    remove,
    inc,
    dec,
    isPending,
    refresh, // 👈 úsalo en /app/cart/page.tsx
  };
}
