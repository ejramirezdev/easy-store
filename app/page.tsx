import HeroCarousel from "@/components/home/Carousel";
import WhatsAppFab from "@/components/home/WhatsAppFab";
import Grid from "@mui/material/GridLegacy";
import { Box, Container, Typography } from "@mui/material";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// tarjetas dummy de destacados (luego vendrán desde la DB)

const featured = await prisma.product.findMany({
  orderBy: { createdAt: "desc" },
  take: 6,
  select: { id: true, name: true, price: true, imageUrl: true },
});

const money = (v: Prisma.Decimal | number) => {
  const n = typeof v === "number" ? v : v.toNumber();
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(n);
};

export default function Page() {
  return (
    <>
      <HeroCarousel />

      {/* Sección de destacados (opcional por ahora) */}
      <Box component="section" sx={{ py: 8, bgcolor: "#0A0A0B" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>
            Nuestros productos destacados
          </Typography>
          <Grid container spacing={3}>
            {featured.map((p) => (
              <Grid item key={p.name} xs={12} sm={6} md={4}>
                <Box sx={{ p: 3, bgcolor: "#101017", borderRadius: 2 }}>
                  <Typography>{p.name}</Typography>
                  <Typography color="text.secondary">
                    {money(p.price)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <WhatsAppFab phone="+593958720950" />
    </>
  );
}
