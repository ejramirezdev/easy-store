// app/api/checkout/preview/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

export async function GET() {
  const session = await getServerSession(authOptions);
  const { cart } = await getOrCreateCart(session?.user?.id);

  if (!cart) {
    return NextResponse.json(
      { ok: false, error: "Carrito no encontrado" },
      { status: 404 }
    );
  }

  // items con producto
  const rawItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          price: true,
        },
      },
    },
  });
  const items = rawItems.map((it) => ({
    id: it.id,
    productId: it.productId,
    quantity: it.quantity,
    product: {
      id: it.product!.id,
      name: it.product!.name,
      slug: it.product!.slug,
      imageUrl: it.product!.imageUrl,
      price: Number(it.product!.price),
    },
    lineTotal: Number(it.product!.price) * it.quantity,
  }));

  // cupón aplicado al carrito (si lo hay)
  const redemption = await prisma.couponRedemption.findFirst({
    where: { cartId: cart.id },
    orderBy: { createdAt: "desc" },
    include: { coupon: true },
  });

  const lines = items.map((x) => ({
    price: x.product.price,
    quantity: x.quantity,
  }));
  const totals = calcTotals(lines, redemption?.coupon ?? undefined);

  return NextResponse.json({
    ok: true,
    items,
    coupon: redemption?.coupon
      ? {
          code: redemption.coupon.code,
          type: redemption.coupon.type,
          value: Number(redemption.coupon.value),
        }
      : null,
    ...totals,
  });
}
