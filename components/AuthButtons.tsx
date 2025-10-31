"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
  Button,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";

type Props = {
  mode?: "desktop" | "mobile";
  onClickAfter?: () => void; // útil para cerrar el menú móvil
};

export default function AuthButtons({ mode = "desktop", onClickAfter }: Props) {
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isDesktop = mode === "desktop";

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: isDesktop
            ? { xs: "none", md: "flex" }
            : { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          px: isDesktop ? 0 : 1.5,
        }}
      >
        <CircularProgress size={24} sx={{ color: "#fff" }} />
      </Box>
    );
  }

  // ------ NO LOGUEADO ------
  if (!session) {
    if (isDesktop) {
      // Botón con tu mismo estilo (visible solo en md+)
      return (
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<LoginIcon />}
          onClick={() => signIn("google")}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            display: { xs: "none", md: "inline-flex" },
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 0.6,
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Iniciar sesión
        </Button>
      );
    }

    // Móvil: botón full width dentro del menú
    return (
      <Box sx={{ display: { xs: "block", md: "none" }, p: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LoginIcon />}
          onClick={() => {
            onClickAfter?.();
            signIn("google");
          }}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            textTransform: "none",
            fontWeight: 600,
            px: 2,
            py: 0.8,
            "&:hover": {
              borderColor: "#fff",
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Iniciar sesión
        </Button>
      </Box>
    );
  }

  // ------ LOGUEADO ------
  if (isDesktop) {
    // Desktop: Avatar + menú
    return (
      <>
        <Avatar
          src={session.user?.image || ""}
          alt={session.user?.name || ""}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            cursor: "pointer",
            width: 36,
            height: 36,
            border: "2px solid rgba(255,255,255,0.3)",
            display: { xs: "none", md: "inline-flex" },
            "&:hover": { borderColor: "#fff" },
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              bgcolor: "#141414",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2">{session.user?.name}</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              signOut();
            }}
          >
            <LogoutIcon sx={{ fontSize: 18, mr: 1 }} /> Cerrar sesión
          </MenuItem>
        </Menu>
      </>
    );
  }

  // Móvil: avatar + nombre + botón Cerrar sesión (full width)
  return (
    <Box sx={{ display: { xs: "block", md: "none" }, px: 1.5, py: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Avatar
          src={session.user?.image || ""}
          alt={session.user?.name || ""}
          sx={{
            width: 36,
            height: 36,
            border: "2px solid rgba(255,255,255,0.3)",
          }}
        />
        <Typography variant="body2">{session.user?.name}</Typography>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        startIcon={<LogoutIcon />}
        onClick={() => {
          onClickAfter?.();
          signOut();
        }}
        sx={{
          borderColor: "rgba(255,255,255,0.3)",
          textTransform: "none",
          fontWeight: 600,
          px: 2,
          py: 0.8,
          "&:hover": {
            borderColor: "#fff",
            backgroundColor: "rgba(255,255,255,0.05)",
          },
        }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
