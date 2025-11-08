import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aventura en el Bosque de los Desafíos",
  description: "Juego educativo para desarrollar concentración, flexibilidad mental y motricidad fina en niños de 4 a 6 años",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster 
          position="top-center"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
