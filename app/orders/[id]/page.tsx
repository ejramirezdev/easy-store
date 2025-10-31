import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import Grid from "@mui/material/GridLegacy";
type PageProps = { params: { id: string } };

export default async function OrderDetailPage({ params }: PageProps) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true, imageUrl: true } },
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  });

  if (!order) return notFound();

  // Totales (soporta snapshot si lo agregaste; si no, usa total)
  const subtotal = order.subtotal
    ? Number(order.subtotal)
    : order.items.reduce(
        (acc, it) => acc + Number(it.unitPrice) * it.quantity,
        0
      );
  const discount = order.discountTotal ? Number(order.discountTotal) : 0;
  const shipping = order.shippingTotal ? Number(order.shippingTotal) : 0;
  const total = order.total
    ? Number(order.total)
    : subtotal - discount + shipping;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Orden #{order.id.slice(0, 8).toUpperCase()}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado
            </Typography>
            <Typography variant="body1">Pago: {order.status}</Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Artículos
            </Typography>
            <Stack spacing={1}>
              {order.items.map((it) => (
                <Stack
                  key={it.id}
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography>
                    {it.product?.name ?? "Producto"} × {it.quantity}
                  </Typography>
                  <Typography>
                    ${(Number(it.unitPrice) * it.quantity).toFixed(2)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={0.5}>
              <Row label="Subtotal" value={subtotal} />
              {discount > 0 && <Row label="Descuento" value={-discount} />}
              {shipping > 0 && <Row label="Envío" value={shipping} />}
              <Divider sx={{ my: 1 }} />
              <Row label="Total" value={total} strong />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Envío
            </Typography>
            <AddressBlock {...order.shippingAddress} />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Facturación
            </Typography>
            <AddressBlock {...order.billingAddress} />
          </Paper>

          <Box mt={2}>
            {/* Placeholder para integrar Kushki/Datafast en el siguiente paso */}
            <Button component={Link} href={`/`} variant="contained" fullWidth>
              Pagar ahora (placeholder)
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

function AddressBlock(addr: any) {
  if (!addr) return <Typography variant="body2">-</Typography>;
  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">
        {addr.firstName} {addr.lastName}
      </Typography>
      <Typography variant="body2">{addr.email}</Typography>
      {addr.phone && <Typography variant="body2">{addr.phone}</Typography>}
      <Typography variant="body2">{addr.line1}</Typography>
      {addr.line2 && <Typography variant="body2">{addr.line2}</Typography>}
      <Typography variant="body2">
        {addr.city}
        {addr.state ? `, ${addr.state}` : ""}
        {addr.postalCode ? `, ${addr.postalCode}` : ""}
      </Typography>
      <Typography variant="body2">{addr.country}</Typography>
    </Stack>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 700 : 400}
      >
        {label}
      </Typography>
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 700 : 400}
      >
        ${value.toFixed(2)}
      </Typography>
    </Stack>
  );
}
