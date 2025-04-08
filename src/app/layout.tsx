import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthGuard } from "@/components/auth-guard";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PayQuick - Gateway de Pagamentos",
  description: "Sua solução completa para pagamentos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={spaceGrotesk.className}>
        <AuthGuard>
          {children}
        </AuthGuard>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
