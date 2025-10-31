// hecho por mi

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, name: true, price: true, slug: true },
  });
  return NextResponse.json(services);
}
