import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiendas Online Admin",
  description: "Panel de administración para emprendimientos online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
