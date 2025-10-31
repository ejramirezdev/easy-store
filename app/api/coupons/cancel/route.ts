import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const { cart, setCookieId } = await getOrCreateCart(session?.user?.id);

  // Quita cualquier cupón aplicado a este cart
  await prisma.couponRedemption.deleteMany({
    where: { cartId: cart.id },
  });

  // Devuelve totales sin cupón (y shipping por defecto)
  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  const lines = (fullCart?.items ?? []).map((it) => ({
    price: Number(it.product.price),
    quantity: it.quantity,
  }));

  const totals = calcTotals(lines, undefined);

  const res = NextResponse.json({
    ok: true,
    coupon: null,
    ...totals,
  });

  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}
