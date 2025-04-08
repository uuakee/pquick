"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Space_Grotesk } from "next/font/google";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para enviar o código
    setStep('code');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a validação do código
    setStep('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a redefinição da senha
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
            <CardHeader className="space-y-6 pb-4">
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-16 w-32 md:w-32">
                  <Image src="/plataform/logo-expand.svg" alt="logo" fill className="object-contain" priority />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {step === 'email' && 'Recuperar Senha'}
                    {step === 'code' && 'Verificar Código'}
                    {step === 'reset' && 'Nova Senha'}
                  </h1>
                  <p className="text-sm text-muted-foreground/80 max-w-sm">
                    {step === 'email' && 'Digite seu e-mail para receber o código de recuperação.'}
                    {step === 'code' && 'Digite o código de 6 dígitos enviado para seu e-mail.'}
                    {step === 'reset' && 'Digite sua nova senha.'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="Digite seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#f25100] text-white hover:bg-[#f25100]/90">
                    Enviar Código
                  </Button>
                </form>
              )}

              {step === 'code' && (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código de Verificação</Label>
                    <div className="flex gap-2 justify-between">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Input
                          key={i}
                          type="text"
                          maxLength={1}
                          className="w-12 text-center p-2"
                          value={code[i] || ''}
                          onChange={(e) => {
                            const newCode = code.split('');
                            newCode[i] = e.target.value;
                            setCode(newCode.join(''));
                            if (e.target.value && e.target.nextElementSibling) {
                              (e.target.nextElementSibling as HTMLInputElement).focus();
                            }
                          }}
                          required
                        />
                      ))}
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-[#f25100] text-white hover:bg-[#f25100]/90">
                    Verificar Código
                  </Button>
                </form>
              )}

              {step === 'reset' && (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      type="password"
                      id="newPassword"
                      placeholder="Digite sua nova senha"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      placeholder="Confirme sua nova senha"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#f25100] text-white hover:bg-[#f25100]/90">
                    Redefinir Senha
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center pt-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground/80 hover:text-[#f25100] transition-colors"
              >
                Voltar para o login
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
} 