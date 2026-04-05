import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP Manager Pro - MooviTelecom",
  description: "Sistema de gestión integral para operadores de telecomunicaciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
