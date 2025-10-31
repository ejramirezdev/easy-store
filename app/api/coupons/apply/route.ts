import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

export async function POST(req: Request) {
  const { code } = await req.json();
  const session = await getServerSession(authOptions);

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }
  const norm = code.trim().toUpperCase();

  // Carrito (logueado o anónimo vía cookie)
  const { cart, setCookieId } = await getOrCreateCart(session?.user?.id);

  // Buscar cupón
  const coupon = await prisma.coupon.findUnique({ where: { code: norm } });
  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Cupón inválido" }, { status: 400 });
  }

  // Validaciones generales
  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return NextResponse.json(
      { error: "Cupón aún no está vigente" },
      { status: 400 }
    );
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return NextResponse.json({ error: "Cupón expirado" }, { status: 400 });
  }

  // Límite global de usos (opcional)
  if (coupon.maxUses != null) {
    const totalUses = await prisma.couponRedemption.count({
      where: { couponId: coupon.id },
    });
    if (totalUses >= coupon.maxUses) {
      return NextResponse.json({ error: "Cupón agotado" }, { status: 400 });
    }
  }

  // Límite por usuario (si hay sesión)
  if (coupon.perUserLimit != null && session?.user?.id) {
    const perUserUses = await prisma.couponRedemption.count({
      where: { couponId: coupon.id, userId: session.user.id },
    });
    if (perUserUses >= coupon.perUserLimit) {
      return NextResponse.json(
        { error: "Límite de uso por usuario alcanzado" },
        { status: 400 }
      );
    }
  }

  // Traer carrito completo para calcular totales y validar minSubtotal
  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  const lines = (fullCart?.items ?? []).map((it) => ({
    price: Number(it.product.price),
    quantity: it.quantity,
  }));

  // Validación de mínimo (tu calcTotals también lo contempla; aquí anticipamos el error)
  if (
    coupon.minSubtotal &&
    lines.reduce((a, l) => a + l.price * l.quantity, 0) <
      Number(coupon.minSubtotal)
  ) {
    return NextResponse.json(
      { error: "No alcanzas el mínimo para este cupón" },
      { status: 400 }
    );
  }

  // Idempotencia: elimina cualquier cupón aplicado previamente en este cart
  await prisma.couponRedemption.deleteMany({ where: { cartId: cart.id } });

  // Marca "aplicado" para este cart (auditoría)
  await prisma.couponRedemption.create({
    data: {
      couponId: coupon.id,
      userId: session?.user?.id ?? null,
      cartId: cart.id,
    },
  });

  // Totales finales (usa tu calcTotals, que maneja PERCENT/FIXED/FREESHIP y shipping)
  const totals = calcTotals(lines, coupon); // { subtotal, discount, shipping, total }

  const res = NextResponse.json({
    ok: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
    },
    ...totals,
  });

  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}
