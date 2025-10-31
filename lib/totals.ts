import type { Coupon } from "@prisma/client";

export type CartLine = { price: number; quantity: number };
export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

// helpers
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const toNumber = (v: unknown) => (v == null ? 0 : Number(v));

function couponIsCurrentlyValid(c?: Coupon, subtotal?: number) {
  if (!c || !c.isActive) return false;
  const now = new Date();
  if (c.startsAt && c.startsAt > now) return false;
  if (c.endsAt && c.endsAt < now) return false;
  if (c.minSubtotal && toNumber(subtotal) < toNumber(c.minSubtotal))
    return false;
  return true;
}

/**
 * Calcula subtotal, descuento, envío y total.
 * - `lines.price` se asume en dólares (p.ej. 79.99), no en centavos.
 * - Envío plano = 5 por defecto; FREESHIP lo pone en 0.
 */
export function calcTotals(
  lines: CartLine[],
  coupon?: Coupon,
  opts?: { shippingFlat?: number }
): Totals {
  const shippingFlat = opts?.shippingFlat ?? 5;

  // Subtotal
  const subtotal = round2(
    lines.reduce((a, l) => a + toNumber(l.price) * toNumber(l.quantity), 0)
  );

  // Descuento
  let discount = 0;
  if (couponIsCurrentlyValid(coupon, subtotal)) {
    const value = toNumber(coupon!.value);
    switch (coupon!.type) {
      case "PERCENT": {
        discount = round2(subtotal * (value / 100));
        break;
      }
      case "FIXED": {
        discount = Math.min(subtotal, round2(value));
        break;
      }
      case "FREESHIP": {
        discount = 0; // se refleja en shipping
        break;
      }
      default:
        discount = 0;
    }
  }

  // Shipping
  let shipping = subtotal > 0 ? shippingFlat : 0;
  if (couponIsCurrentlyValid(coupon, subtotal) && coupon!.type === "FREESHIP") {
    shipping = 0;
  }
  shipping = round2(shipping);

  // Total
  const total = Math.max(0, round2(subtotal - discount + shipping));

  return { subtotal, discount, shipping, total };
}
