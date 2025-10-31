"use client";

import { useState } from "react";
import {
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Tooltip,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useCart } from "@/lib/useCart";

type Props = {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  variant?: "full" | "icon"; // 👈 nuevo
  tooltip?: string;
};

export default function AddToCartButton({
  productId,
  quantity = 1,
  disabled,
  variant = "full",
  tooltip = "Agregar al carrito",
}: Props) {
  const { add, isPending } = useCart();
  const [open, setOpen] = useState(false);
  const loading = isPending(productId, "add");

  const onAdd = async () => {
    await add(productId, quantity);
    setOpen(true);
  };

  if (variant === "icon") {
    return (
      <>
        <Tooltip title={tooltip}>
          <span>
            <IconButton
              onClick={onAdd}
              disabled={disabled || loading}
              sx={{
                bgcolor: "secondary.main",
                color: "white",
                "&:hover": { bgcolor: "secondary.dark" },
                width: 40,
                height: 40,
              }}
              aria-label="Agregar al carrito"
            >
              {loading ? (
                <CircularProgress size={18} />
              ) : (
                <AddShoppingCartIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Snackbar
          open={open}
          autoHideDuration={1200}
          onClose={() => setOpen(false)}
          message="Agregado al carrito"
        />
      </>
    );
  }

  // variante "full" (texto)
  return (
    <>
      <Button
        onClick={onAdd}
        startIcon={
          loading ? <CircularProgress size={16} /> : <AddShoppingCartIcon />
        }
        variant="contained"
        color="secondary"
        disabled={disabled || loading}
        fullWidth
      >
        {loading ? "Agregando..." : "Agregar al carrito"}
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={1200}
        onClose={() => setOpen(false)}
        message="Agregado al carrito"
      />
    </>
  );
}
