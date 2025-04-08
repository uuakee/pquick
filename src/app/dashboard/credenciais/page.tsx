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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Download,
  Check
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ApiKey {
  id: number;
  client_id: string;
  client_secret: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export default function CredentialsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch("/api/v1/credentials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }
        throw new Error("Erro ao carregar credenciais");
      }

      const data = await response.json();
      setApiKeys(data.apiKeys);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar credenciais");
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch("/api/v1/credentials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao criar credencial");
      }

      const data = await response.json();
      setApiKeys((prev) => [...prev, data.apiKey]);
      setNewApiKey(data.apiKey);
      setShowCredentials(true);
      toast.success("Credencial criada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar credencial");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!newApiKey) return;

    const credentials = {
      client_id: newApiKey.client_id,
      client_secret: newApiKey.client_secret,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(credentials, null, 2));
      setCopied(true);
      toast.success("Credenciais copiadas para a área de transferência!");
    } catch (err) {
      toast.error("Erro ao copiar credenciais");
    }
  };

  const downloadCredentials = () => {
    if (!newApiKey) return;

    const credentials = {
      client_id: newApiKey.client_id,
      client_secret: newApiKey.client_secret,
    };

    const blob = new Blob([JSON.stringify(credentials, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payquick-credentials-${newApiKey.client_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    toast.success("Credenciais baixadas com sucesso!");
  };

  const handleCloseDialog = () => {
    if (!copied && !downloaded) {
      toast.error("Você precisa copiar ou baixar suas credenciais antes de fechar");
      return;
    }
    setShowCredentials(false);
    setNewApiKey(null);
    setCopied(false);
    setDownloaded(false);
  };

  const revokeApiKey = async (id: number) => {
    try {
      setIsRevoking(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await fetch(`/api/v1/credentials/${id}/revoke`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao revogar credencial");
      }

      setApiKeys((prev) =>
        prev.map((key) =>
          key.id === id ? { ...key, status: "REVOKED" } : key
        )
      );
      toast.success("Credencial revogada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao revogar credencial");
    } finally {
      setIsRevoking(false);
    }
  };

  const getStatusBadge = (status: ApiKey["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ativa
          </Badge>
        );
      case "REVOKED":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Revogada
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expirada
          </Badge>
        );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">PayQuick</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Credenciais</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Credenciais de API</CardTitle>
                  <CardDescription>
                    Gerencie suas chaves de API para integração com a plataforma.
                  </CardDescription>
                </div>
                {!apiKeys.some((key) => key.status === "ACTIVE") && (
                  <Button
                    onClick={createApiKey}
                    disabled={isCreating}
                    className="bg-[#f25100] text-white hover:bg-[#f25100]/90"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Credenciais
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Key className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      Nenhuma credencial encontrada
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Crie sua primeira credencial para começar a integração.
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-mono">
                          {key.client_id}
                        </TableCell>
                        <TableCell>{getStatusBadge(key.status)}</TableCell>
                        <TableCell>
                          {new Date(key.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {new Date(key.updatedAt).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right">
                          {key.status === "ACTIVE" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokeApiKey(key.id)}
                              disabled={isRevoking}
                            >
                              {isRevoking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Revogar"
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showCredentials} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Credenciais Geradas</DialogTitle>
              <DialogDescription className="text-destructive">
                ATENÇÃO: Copie ou baixe suas credenciais agora. Após fechar, você não poderá mais ver o client_secret.
              </DialogDescription>
            </DialogHeader>
            {newApiKey && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">client_id:</span>
                    <span className="truncate">{newApiKey.client_id}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">client_secret:</span>
                    <span className="truncate">{newApiKey.client_secret.slice(0, 16)}...</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className={`flex-1 ${copied ? "bg-green-600 hover:bg-green-700" : ""}`}
                    variant={copied ? "default" : "outline"}
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copiado!" : "Copiar"}
                  </Button>
                  <Button
                    className={`flex-1 ${downloaded ? "bg-green-600 hover:bg-green-700" : ""}`}
                    variant={downloaded ? "default" : "outline"}
                    onClick={downloadCredentials}
                  >
                    {downloaded ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {downloaded ? "Baixado!" : "Baixar"}
                  </Button>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {copied || downloaded ? (
                      "✓ Você já pode fechar esta janela"
                    ) : (
                      "⚠️ Você precisa copiar ou baixar suas credenciais antes de fechar"
                    )}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleCloseDialog}
                className="w-full"
                disabled={!copied && !downloaded}
              >
                {copied || downloaded ? "Fechar" : "Copie ou Baixe Primeiro"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
} 