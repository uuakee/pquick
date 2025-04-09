import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { prisma } from "@/lib/prisma";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const platform = await prisma.plataform.findFirst();

  return {
    title: platform?.name ? `${platform.name} - Gateway de Pagamentos` : "Gateway de Pagamentos",
    description: platform?.description || "Sua solução completa para pagamentos online",
  };
}

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
