"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransferDialogProps {
  trigger: React.ReactNode;
}

export function TransferDialog({ trigger }: TransferDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    amount: "",
    description: "",
  });

  const availableBalance = user?.wallet?.available_balance || 0;
  const isAmountValid = parseFloat(formData.amount) <= availableBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAmountValid) {
      toast.error("Saldo insuficiente para realizar a transferência");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/transactions/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success("Transferência realizada com sucesso!");
      setOpen(false);
      setFormData({ username: "", amount: "", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar transferência");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Nova Transferência
          </DialogTitle>
          <DialogDescription className="pt-2.5">
            Realize uma transferência para outro usuário usando o username.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>Saldo Disponível</span>
            </div>
            <p className="font-medium">{formatCurrency(availableBalance)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username do Destinatário</Label>
            <Input
              id="username"
              placeholder="Digite o username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Transferência</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
                min="0.01"
                step="0.01"
                className={cn(
                  "pr-12 font-medium",
                  !isAmountValid && formData.amount && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                BRL
              </span>
            </div>
            {!isAmountValid && formData.amount && (
              <p className="text-sm text-red-500">
                Saldo insuficiente para esta transferência
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !isAmountValid && formData.amount !== ""} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferindo...
                </>
              ) : (
                <>
                  Transferir
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 