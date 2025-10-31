import { Decimal } from "@prisma/client/runtime/library";
import type { Coupon } from "@prisma/client";

export type CartLine = { price: number; quantity: number };
export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

export function calcTotals(lines: CartLine[], coupon?: Coupon): Totals {
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);

  let discount = 0;
  if (coupon && coupon.isActive) {
    if (coupon.minSubtotal && subtotal < Number(coupon.minSubtotal)) {
      // no cumple mínimo => sin descuento
    } else {
      if (coupon.type === "PERCENT") {
        discount = +(subtotal * (Number(coupon.value) / 100)).toFixed(2);
      } else if (coupon.type === "FIXED") {
        discount = Math.min(subtotal, Number(coupon.value));
      } else if (coupon.type === "FREESHIP") {
        // Lo tratamos en shipping
      }
    }
  }

  let shipping = subtotal - discount > 0 ? 5 : 0; // ejemplo flat 5
  if (coupon?.type === "FREESHIP") shipping = 0;

  const total = Math.max(0, +(subtotal - discount + shipping).toFixed(2));
  return {
    subtotal: +subtotal.toFixed(2),
    discount,
    shipping,
    total,
  };
}
