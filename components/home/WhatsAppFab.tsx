"use client";
import { Fab } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function WhatsAppFab({
  phone = "+593958720950",
}: {
  phone?: string;
}) {
  const link = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return (
    <Fab
      color="success"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      sx={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1300,
      }}
    >
      <WhatsAppIcon />
    </Fab>
  );
}
