// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";
import { calcTotals } from "@/lib/totals";

type AddressInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentId?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { shipping, billing, notes } = body as {
      shipping: AddressInput;
      billing?: AddressInput | { useShipping: true };
      notes?: string;
    };

    const { cart } = await getOrCreateCart(session.user.id);
    if (!cart)
      return NextResponse.json(
        { ok: false, error: "Carrito no encontrado" },
        { status: 404 }
      );

    // items del carrito (con precios actuales)
    const rawItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });
    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Carrito vacío" },
        { status: 400 }
      );
    }

    const items = rawItems.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: String(it.product!.price), // Decimal como string
      snapshot: {
        name: it.product!.name,
        slug: it.product!.slug,
        imageUrl: it.product!.imageUrl,
      },
    }));

    // cupón aplicado
    const redemption = await prisma.couponRedemption.findFirst({
      where: { cartId: cart.id },
      orderBy: { createdAt: "desc" },
      include: { coupon: true },
    });

    // totales (números en USD)
    const totals = calcTotals(
      items.map((x) => ({ price: Number(x.unitPrice), quantity: x.quantity })),
      redemption?.coupon ?? undefined
    );

    // direcciones
    const shippingAddress = await prisma.address.create({ data: shipping });
    const billingAddress =
      billing && "useShipping" in billing
        ? shippingAddress
        : await prisma.address.create({
            data: (billing as AddressInput) ?? shipping,
          });

    // crear orden + items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total: String(totals.total), // Decimal(10,2)
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        // snapshot de totales/cupón (si agregaste los campos)
        subtotal: String(totals.subtotal),
        discountTotal: String(totals.discount),
        shippingTotal: String(totals.shipping),
        taxTotal: "0.00",
        couponCode: redemption?.coupon?.code ?? null,
        couponAmount: redemption?.coupon
          ? String(Number(redemption.coupon.value))
          : null,

        items: {
          create: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice, // Decimal as string
            // si luego agregas campos snapshot en OrderItem, puedes guardarlos aquí
          })),
        },
      },
    });

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Error creando orden" },
      { status: 400 }
    );
  }
}
