"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Bell, 
  Plus, 
  Loader2, 
  QrCode,
  CreditCard,
  Trash2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Webhook {
  id: number;
  url: string;
  type: "QRCODE" | "PAYMENT";
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    type: "",
  });

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/webhooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar webhooks");
      }

      const data = await response.json();
      setWebhooks(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar webhooks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateWebhook = async () => {
    if (!formData.url || !formData.type) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Validar URL
    try {
      new URL(formData.url);
    } catch {
      toast.error("URL inválida");
      return;
    }

    // Verificar se já existe webhook do mesmo tipo
    const existingWebhook = webhooks.find(webhook => webhook.type === formData.type);
    if (existingWebhook) {
      toast.error(`Já existe um webhook do tipo ${formData.type}. Remova-o primeiro.`);
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar webhook");
      }

      await fetchWebhooks();
      setOpenDialog(false);
      setFormData({ url: "", type: "" });
      toast.success("Webhook criado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar webhook");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWebhook = async (id: number) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/webhooks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir webhook");
      }

      await fetchWebhooks();
      toast.success("Webhook excluído com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir webhook");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">PayQuick</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Webhooks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/levels/challenger.svg" alt="Medal Bronze" width={32} height={32} />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Nível Challenger</span>
              <span className="text-xs text-muted-foreground underline cursor-pointer hover:text-primary">Ver perfil</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Webhooks</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seus webhooks para receber notificações em tempo real.
              </p>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#f25100] text-white hover:bg-[#f25100]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Webhook</DialogTitle>
                  <DialogDescription>
                    Configure um novo endpoint para receber notificações.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Webhook</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QRCODE">QR Code</SelectItem>
                        <SelectItem value="PAYMENT">Pagamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL do Webhook</Label>
                    <Input
                      placeholder="https://sua-api.com/webhook"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-[#f25100] text-white hover:bg-[#f25100]/90"
                    onClick={handleCreateWebhook}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Webhook"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum webhook configurado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Você ainda não configurou nenhum webhook. Clique no botão acima para começar.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg p-2 bg-muted">
                        {webhook.type === "QRCODE" ? (
                          <QrCode className="h-6 w-6" />
                        ) : (
                          <CreditCard className="h-6 w-6" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{webhook.type === "QRCODE" ? "QR Code" : "Pagamento"}</p>
                        <p className="text-sm text-muted-foreground break-all">{webhook.url}</p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(webhook.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleDeleteWebhook(webhook.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 