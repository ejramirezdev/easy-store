import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { cart, setCookieId } = await getOrCreateCart(userId);

  // Limpia cupón aplicado en cart si lo guardas
  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      /* couponCode: null */
    },
  });

  // Recalcula totales sin cupón
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { select: { price: true } } },
  });
  const lines = items.map((it) => ({
    price: Number(it.product.price),
    quantity: it.quantity,
  }));
  const totals = calcTotals(lines);

  const res = NextResponse.json({ ok: true, totals });
  if (setCookieId)
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  return res;
}
