import type { Metadata } from "next";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "@/theme";
import Header from "@/components/Header";
import Providers from "./providers";
import { UiLockProvider } from "@/lib/ui-lock";
import UiLockOverlay from "@/components/common/UiLockOverlay";

export const metadata: Metadata = {
  title: "Easy Store",
  description: "Tecnología sin complicaciones.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="body-bg" suppressHydrationWarning>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <UiLockProvider>
            <UiLockOverlay />
            <Providers>
              <Header />
              {children}
            </Providers>
          </UiLockProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
