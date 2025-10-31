"use client";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/useCart";
import { useUiLock } from "@/lib/ui-lock";

export default function HeaderCartButton() {
  const [open, setOpen] = useState(false);
  const { count, items, subtotal, isLoading, remove, inc, dec, isPending } =
    useCart();
  const { locked } = useUiLock();
  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label="Carrito"
        disabled={locked}
      >
        <Badge badgeContent={count} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 360,
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography variant="h6">Tu carrito</Typography>
          <Divider />

          {isLoading ? (
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Typography sx={{ py: 4 }} color="text.secondary">
              Aún no tienes productos.
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  maxHeight: "50vh",
                  overflowY: "auto",
                }}
              >
                {items.map((it) => {
                  const loadInc = isPending(it.productId, "inc");
                  const loadDec = isPending(it.productId, "dec");
                  const loadRemove = isPending(it.productId, "remove");
                  const disabledAll = loadInc || loadDec || loadRemove;

                  return (
                    <Box
                      key={it.id}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        p: 1.25,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                        alignItems: "center",
                      }}
                    >
                      {/* Miniatura */}
                      <Box
                        component="img"
                        src={it.product.imageUrl ?? "/placeholder.png"}
                        alt={it.product.name}
                        sx={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          flexShrink: 0,
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                        }}
                      />

                      {/* Info + controles */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
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
                              ${Number(it.product.price).toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography fontWeight={800}>
                            $
                            {(Number(it.product.price) * it.quantity).toFixed(
                              2
                            )}
                          </Typography>
                        </Box>

                        {/* Controles */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                            opacity: disabledAll ? 0.75 : 1,
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
                            {loadRemove ? (
                              <CircularProgress size={14} />
                            ) : (
                              "Quitar"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1">Subtotal</Typography>
                <Typography variant="h6">
                  ${Number(subtotal).toFixed(2)}
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/cart"
                variant="contained"
                size="large"
                onClick={() => setOpen(false)}
              >
                Ir al carrito
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
