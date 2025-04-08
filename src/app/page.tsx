"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Space_Grotesk } from "next/font/google";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      // Salvar token no localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirecionar para o dashboard
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={spaceGrotesk.className}>  
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] scale-[1.2]" />
        <div className="absolute inset-0 bg-[#f25100]/5 blur-[100px] rotate-12" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#f25100]/25 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#f25100]/25 blur-[100px]" />
        
        <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md border border-white/10 bg-card/30 backdrop-blur-xl shadow-xl shadow-black/10">
            <CardHeader className="space-y-6 pb-4s">
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-16 w-32 md:w-32">
                  <Image src="/plataform/logo-expand.svg" alt="logo" fill className="object-contain" priority />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    Bem-vindo!
                  </h1>
                  <p className="text-sm text-muted-foreground/80 max-w-sm">
                    Faça login para acessar o dashboard e operar com segurança.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">E-mail ou Username</Label>
                  <Input
                    type="text"
                    id="identifier"
                    placeholder="Digite seu e-mail ou username"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    disabled={isLoading}
                  />   
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#f25100] text-white hover:bg-[#f25100]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
                <div className="text-center text-sm text-muted-foreground/80">
                  <Link href="/forgot-password">Esqueceu sua senha?</Link>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator className="w-full" />
              <div className="text-center text-sm text-muted-foreground/80">
                <Link href="/signup">Não tem uma conta? <span className="text-[#f25100]">Cadastre-se</span></Link>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}
