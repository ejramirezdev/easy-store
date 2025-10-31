import { Container, Typography, Box, Button } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        Producto no encontrado
      </Typography>
      <Typography color="text.secondary" gutterBottom>
        El artículo que buscas no existe o fue removido.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Link href="/products">
          <Button variant="contained" color="secondary">
            Ver catálogo
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
