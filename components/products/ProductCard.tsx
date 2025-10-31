"use client";

import { Card, CardContent, CardMedia, Box, Typography } from "@mui/material";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductLinkCard from "@/components/products/ProductLinkCard";

export type UiProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
};

export default function ProductCard({ product }: { product: UiProduct }) {
  const href = `/products/${encodeURIComponent(product.slug)}`;

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Zona clickeable protegida por el guard */}
      <ProductLinkCard href={`/products/${product.slug}`}>
        {product.imageUrl && (
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.name}
            sx={{ height: 172, objectFit: "cover" }}
          />
        )}
      </ProductLinkCard>

      <CardContent sx={{ flex: 1, pb: 1.5 }}>
        <ProductLinkCard href={`/products/${product.slug}`}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            gutterBottom
            noWrap
            sx={{ color: "#fff" }}
          >
            {product.name}
          </Typography>
        </ProductLinkCard>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 36,
            }}
          >
            {product.description}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Typography variant="h6" fontWeight={800} color="secondary">
            ${Number(product.price).toFixed(2)}
          </Typography>
          <AddToCartButton productId={product.id} variant="icon" />
        </Box>
      </CardContent>
    </Card>
  );
}
