import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code)
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: { equals: code.trim(), mode: "insensitive" },
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
      AND: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
    },
  });
  if (!coupon)
    return NextResponse.json(
      { error: "Cupón inválido o inactivo" },
      { status: 404 }
    );

  const { cart, setCookieId } = await getOrCreateCart(userId);

  // Trae items y calcula totales simulando el cupón
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: { select: { price: true } } },
  });
  const lines = items.map((it) => ({
    price: Number(it.product.price),
    quantity: it.quantity,
  }));
  const totals = calcTotals(lines, coupon);

  // (Opcional) persistir el cupón en el carrito (ej: cart.couponCode)
  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      /* couponCode: coupon.code */
    },
  });

  const res = NextResponse.json({
    ok: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
    },
    totals,
  });
  if (setCookieId)
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  return res;
}
