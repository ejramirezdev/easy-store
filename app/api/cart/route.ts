import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart } from "@/lib/cart";

// Utilidad: formatea el carrito a un payload plano (Decimal -> number)
async function buildCartPayload(cartId: string) {
  const rawItems = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true, // Decimal
          imageUrl: true,
        },
      },
    },
  });

  const items = rawItems.map((it) => ({
    id: it.id,
    cartId: it.cartId,
    productId: it.productId,
    quantity: it.quantity,
    product: {
      id: it.product.id,
      name: it.product.name,
      imageUrl: it.product.imageUrl,
      price: Number(it.product.price), // <- normalizado a number
    },
  }));

  const count = items.reduce((a, it) => a + it.quantity, 0);
  const subtotal = items.reduce(
    (a, it) => a + it.quantity * Number(it.product.price),
    0
  );

  return { id: cartId, items, count, subtotal };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { cart, setCookieId } = await getOrCreateCart(userId);

  const payload = await buildCartPayload(cart.id);

  const res = NextResponse.json(payload);
  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}

// body: { productId: string, quantity?: number } -> incrementa (default 1)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { productId, quantity = 1 } = (await req.json()) as {
    productId: string;
    quantity?: number;
  };

  if (!productId || quantity <= 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Validar producto
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true }, // mínimo
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { cart, setCookieId } = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: { increment: quantity } },
  });

  const payload = await buildCartPayload(cart.id);

  const res = NextResponse.json(payload);
  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}

// body: { productId: string, quantity: number } -> setea cantidad exacta (0 elimina)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { productId, quantity } = (await req.json()) as {
    productId: string;
    quantity: number;
  };

  if (!productId || typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { cart, setCookieId } = await getOrCreateCart(userId);

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity },
    });
  }

  const payload = await buildCartPayload(cart.id);

  const res = NextResponse.json(payload);
  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}

// body: { productId: string } -> elimina ítem
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { productId } = (await req.json()) as { productId: string };

  if (!productId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { cart, setCookieId } = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  const payload = await buildCartPayload(cart.id);

  const res = NextResponse.json(payload);
  if (setCookieId) {
    res.cookies.set(setCookieId.name, setCookieId.value, setCookieId.options);
  }
  return res;
}
