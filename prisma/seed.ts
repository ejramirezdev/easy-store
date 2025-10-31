// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Categorías base
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "laptops" },
      update: {},
      create: { name: "Laptops", slug: "laptops" },
    }),
    prisma.category.upsert({
      where: { slug: "accesorios" },
      update: {},
      create: { name: "Accesorios", slug: "accesorios" },
    }),
    prisma.category.upsert({
      where: { slug: "software" },
      update: {},
      create: { name: "Software", slug: "software" },
    }),
  ]);

  const [laptops, accesorios, software] = categories;

  // Productos (precio como string para Decimal)
  const productsData = [
    {
      name: "Laptop Gamer GX15",
      slug: "laptop-gamer-gx15",
      description:
        "Laptop gamer 15.6” FHD 144Hz, Ryzen 7, 16GB RAM, RTX 4060, 512GB SSD.",
      price: "1299.99",
      stock: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&q=80&auto=format&fit=crop",
      categoryId: laptops.id,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80&auto=format&fit=crop",
      ],
    },
    {
      name: "Mouse RGB Pro",
      slug: "mouse-rgb-pro",
      description:
        "Mouse ergonómico con sensor óptico 16K DPI, 6 botones programables.",
      price: "39.90",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1585518419759-d9e26562bb2b?w=1400&q=80&auto=format&fit=crop",
      categoryId: accesorios.id,
      images: [
        "https://images.unsplash.com/photo-1585518419759-d9e26562bb2b?w=1200&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1585518419759-d9e26562bb2b?w=1000&q=80&auto=format&fit=crop",
      ],
    },
    {
      name: "Teclado Mecánico 60%",
      slug: "teclado-mecanico-60",
      description:
        "Formato compacto con switches rojos, keycaps PBT, iluminación per-key.",
      price: "79.00",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&q=80&auto=format&fit=crop",
      categoryId: accesorios.id,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80&auto=format&fit=crop",
      ],
    },
    {
      name: "Licencia Web Booster",
      slug: "licencia-web-booster",
      description:
        "Suite de optimización para sitios web (SEO básico + performance).",
      price: "59.00",
      stock: 999,
      imageUrl:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&q=80&auto=format&fit=crop",
      categoryId: software.id,
      images: [
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80&auto=format&fit=crop",
      ],
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price as any,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price as any,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryId: p.categoryId,
      },
    });

    // Limpia/repuebla galería (simple para seed)
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, idx) => ({
        productId: product.id,
        url,
        alt: `${p.name} - imagen ${idx + 1}`,
        sortOrder: idx,
      })),
    });
  }

  console.log("✅ Seed listo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
