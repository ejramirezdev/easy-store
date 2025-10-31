"use client";

import Link from "next/link";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState, useTransition } from "react";
import { useCart } from "@/lib/useCart";

export default function CartPage() {
  const {
    cart, // 👈 acceso al objeto completo
    items,
    count,
    subtotal,
    // 👇 nuevos campos que ahora devuelve el backend
    // (si tu hook no los expone aún, puedes leerlos de `cart?.discount` etc.)
    // discount,
    // shipping,
    // total,
    isLoading,
    inc,
    dec,
    remove,
    isPending,
    refresh, // refresca después de aplicar/quitar cupón
  } = useCart();

  // Totales desde el payload (con fallback por si no vinieran aún)
  const discount = cart?.discount ?? 0;
  const shipping = cart?.shipping ?? 0;
  const total = cart?.total ?? subtotal;

  // Cupón aplicado
  const appliedCoupon = cart?.coupon; // { code, type, value } | null

  // Estado local para cupones
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pendingCoupon, startTransition] = useTransition();

  const apply = () => {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/coupons/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErr(data?.error ?? "Cupón inválido");
          return;
        }
        setMsg(`Cupón ${data.coupon.code} aplicado`);
        setCode("");
        refresh(); // ← vuelve a pedir /api/cart con descuento/total
      } catch {
        setErr("Error al aplicar el cupón");
      }
    });
  };

  const cancel = () => {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/coupons/cancel", { method: "DELETE" });
        await res.json();
        setMsg("Cupón removido");
        refresh();
      } catch {
        setErr("No se pudo quitar el cupón");
      }
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
        Tu carrito
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {isLoading ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Aún no tienes productos en el carrito.
          </Typography>
          <Button component={Link} href="/products" variant="contained">
            Ver productos
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Lista de ítems */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {items.map((it) => {
              const loadInc = isPending(it.productId, "inc");
              const loadDec = isPending(it.productId, "dec");
              const loadRemove = isPending(it.productId, "remove");
              const disabledAll = loadInc || loadDec || loadRemove;

              const unit = Number(it.product.price ?? 0);
              const line = unit * it.quantity;

              return (
                <Box
                  key={it.id}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  {/* Miniatura */}
                  <Box
                    component="img"
                    src={it.product.imageUrl ?? "/placeholder.png"}
                    alt={it.product.name}
                    sx={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      flexShrink: 0,
                    }}
                  />

                  {/* Info + controles */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          fontWeight={700}
                          noWrap
                          title={it.product.name}
                        >
                          {it.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${unit.toFixed(2)}
                        </Typography>
                      </Box>

                      <Typography fontWeight={800}>
                        ${line.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                        opacity: disabledAll ? 0.8 : 1,
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => dec(it.productId, it.quantity)}
                        disabled={disabledAll}
                      >
                        {loadDec ? <CircularProgress size={14} /> : "-"}
                      </Button>

                      <Typography>{it.quantity}</Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => inc(it.productId, it.quantity)}
                        disabled={disabledAll}
                      >
                        {loadInc ? <CircularProgress size={14} /> : "+"}
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        onClick={() => remove(it.productId)}
                        disabled={disabledAll}
                        sx={{ ml: 0.5 }}
                      >
                        {loadRemove ? <CircularProgress size={14} /> : "Quitar"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Resumen + Cupón */}
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              height: "fit-content",
              position: "sticky",
              top: 24,
            }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Resumen
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Campo cupón */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mb: 1 }}
            >
              <TextField
                size="small"
                label={
                  appliedCoupon
                    ? `Cupón aplicado: ${appliedCoupon.code}`
                    : "Código de cupón"
                }
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={pendingCoupon || !!appliedCoupon}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={apply}
                disabled={!code || pendingCoupon || !!appliedCoupon}
              >
                {pendingCoupon ? <CircularProgress size={18} /> : "Aplicar"}
              </Button>
              <Button
                onClick={cancel}
                disabled={pendingCoupon || !appliedCoupon}
              >
                {pendingCoupon ? (
                  <CircularProgress size={18} />
                ) : (
                  "Quitar cupón"
                )}
              </Button>
            </Stack>

            {/* Mensajes */}
            {appliedCoupon && (
              <Alert severity="info" sx={{ mb: 1 }}>
                Cupón <strong>{appliedCoupon.code}</strong> activo
                {appliedCoupon.type === "PERCENT" &&
                  ` (-${appliedCoupon.value}% )`}
                {appliedCoupon.type === "FIXED" &&
                  ` (-$${Number(appliedCoupon.value).toFixed(2)})`}
                {appliedCoupon.type === "FREESHIP" && " (Envío gratis)"}
              </Alert>
            )}
            {msg && (
              <Alert severity="success" sx={{ mb: 1 }}>
                {msg}
              </Alert>
            )}
            {err && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {err}
              </Alert>
            )}

            {/* Totales */}
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <Row label="Artículos" value={count} isInt />
              <Row label="Subtotal" value={Number(subtotal)} />
              {discount > 0 && (
                <Row label="Descuento" value={-Number(discount)} />
              )}
              <Row label="Envío" value={Number(shipping)} />
              <Row label="Total" value={Number(total)} strong />
            </Stack>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              component={Link}
              href="/checkout"
            >
              Proceder al checkout
            </Button>

            <Button fullWidth component={Link} href="/products" sx={{ mt: 1 }}>
              Seguir comprando
            </Button>
          </Box>
        </Box>
      )}
    </Container>
  );
}

function Row({
  label,
  value,
  strong = false,
  isInt = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  isInt?: boolean;
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={strong ? 800 : 600}>
        {isInt ? value : `$${Number(value).toFixed(2)}`}
      </Typography>
    </Box>
  );
}
