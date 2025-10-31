// app/products/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Divider,
  Chip,
  Stack,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import ProductGallery from "@/components/products/ProductGallery";
import AddToCartButton from "@/components/products/AddToCartButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw ?? "").trim();
  if (!slug) return {};

  const product = await prisma.product.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
    select: { name: true, description: true, imageUrl: true },
  });
  if (!product) return {};

  return {
    title: `${product.name} | Easy Store`,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw ?? "").trim();
  if (!slug) notFound();

  const product = await prisma.product.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      stock: true,
      imageUrl: true,
      images: {
        select: { id: true, url: true, alt: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
      category: { select: { name: true, slug: true } },
      createdAt: true,
    },
  });

  if (!product) notFound();

  const price = Number(product.price);

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ProductGallery
            images={
              product.images?.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt ?? null,
              })) ?? []
            }
            imageUrl={product.imageUrl ?? null}
            name={product.name}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={900}>
              {product.name}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={800} color="secondary">
                ${price.toFixed(2)}
              </Typography>
              {product.stock <= 0 ? (
                <Chip label="Agotado" color="default" size="small" />
              ) : (
                <Chip
                  label={`Stock: ${product.stock}`}
                  color="success"
                  size="small"
                />
              )}
              {product.category && (
                <Chip
                  label={product.category.name}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "rgba(255,255,255,0.2)" }}
                />
              )}
            </Stack>

            {product.description && (
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {product.description}
              </Typography>
            )}

            <Box>
              <AddToCartButton
                productId={product.id}
                disabled={product.stock <= 0}
                variant="full"
              />
            </Box>

            <Paper
              variant="outlined"
              sx={{ p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2 }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Detalles
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Categoría: {product.category?.name ?? "—"}
                </Typography>
                <Typography variant="body2">
                  Publicado: {product.createdAt.toLocaleDateString()}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
