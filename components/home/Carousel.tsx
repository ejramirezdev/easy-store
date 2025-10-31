"use client";
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

type Slide = {
  title: string;
  subtitle: string;
  cta1: { label: string; href: string };
  cta2: { label: string; href: string };
  bg?: string; // imagen opcional
  tag?: string;
};

const slides: Slide[] = [
  {
    title: "Innovación al alcance de tus manos.",
    subtitle:
      "Productos tecnológicos y servicios profesionales en software y hardware.",
    cta1: { label: "Ver productos", href: "/productos" },
    cta2: { label: "Solicitar servicio", href: "/servicios" },
    bg: "/hero/hero-products.png",
    tag: "Destacados",
  },
  {
    title: "Reparación profesional de laptops",
    subtitle:
      "Diagnóstico, mantenimiento y optimización con repuestos de calidad.",
    cta1: { label: "Servicio de hardware", href: "/servicios#hardware" },
    cta2: { label: "Agenda tu cita", href: "/contacto" },
    bg: "/hero/hero-hardware.png",
    tag: "Hardware",
  },
  {
    title: "Desarrollo de software a medida",
    subtitle: "Web apps modernas, seguras y escalables para tu negocio.",
    cta1: { label: "Servicios de software", href: "/servicios#software" },
    cta2: { label: "Cotizar proyecto", href: "/contacto" },
    bg: "/hero/hero-software.png",
    tag: "Software",
  },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [index, setIndex] = useState(0);

  // listeners para actualizar el indicador activo
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

  return (
    <Box sx={{ position: "relative", bgcolor: "#0F0F12" }}>
      {/* Carrusel */}
      <Box ref={emblaRef} sx={{ overflow: "hidden" }}>
        <Box sx={{ display: "flex" }}>
          {slides.map((s, i) => (
            <Box
              key={i}
              sx={{
                position: "relative",
                flex: "0 0 100%",
                minHeight: { xs: 380, md: 520 },
                background: s.bg
                  ? `linear-gradient(180deg, rgba(10,10,11,.35), rgba(10,10,11,.8)), url(${s.bg})`
                  : "radial-gradient(80% 60% at 50% 10%, rgba(216,27,156,.18), transparent 60%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Stack spacing={2} sx={{ maxWidth: 780 }}>
                  {s.tag && (
                    <Chip
                      label={s.tag}
                      color="primary"
                      variant="filled"
                      sx={{ width: "fit-content" }}
                    />
                  )}
                  <Typography variant="h2">{s.title}</Typography>
                  <Typography variant="h6" color="text.secondary">
                    {s.subtitle}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button
                      href={s.cta1.href}
                      variant="contained"
                      color="primary"
                    >
                      {s.cta1.label}
                    </Button>
                    <Button
                      href={s.cta2.href}
                      variant="outlined"
                      color="inherit"
                    >
                      {s.cta2.label}
                    </Button>
                  </Stack>
                </Stack>
              </Container>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Flechas */}
      <IconButton
        onClick={prev}
        sx={{
          position: "absolute",
          top: "50%",
          left: 12,
          transform: "translateY(-50%)",
          border: "1px solid rgba(255,255,255,.25)",
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={next}
        sx={{
          position: "absolute",
          top: "50%",
          right: 12,
          transform: "translateY(-50%)",
          border: "1px solid rgba(255,255,255,.25)",
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Bullets */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {slides.map((_, i) => (
          <Box
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: i === index ? "primary.main" : "rgba(255,255,255,.35)",
              cursor: "pointer",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
