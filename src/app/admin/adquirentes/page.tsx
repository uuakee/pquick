"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Loader2, SaveIcon } from "lucide-react";
import { AdquirenteStatus } from "@prisma/client";

interface Adquirente {
  id: number;
  primepag_status: AdquirenteStatus;
  primepag_uri: string | null;
  primepag_ci: string | null;
  primepag_cs: string | null;
  primepag_name: string | null;
  zendry_status: AdquirenteStatus;
  zendry_uri: string | null;
  zendry_ci: string | null;
  zendry_cs: string | null;
  zendry_name: string | null;
}

export default function AdquirentesPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [adquirente, setAdquirente] = useState<Adquirente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/dashboard");
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchAdquirentes();
  }, []);

  const fetchAdquirentes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/admin/adquirentes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdquirente(data);
      }
    } catch (error) {
      console.error("Erro ao buscar adquirentes:", error);
      toast.error("Erro ao carregar adquirentes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adquirente) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/v1/admin/adquirentes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adquirente),
      });

      if (response.ok) {
        toast.success("Configurações salvas com sucesso");
        fetchAdquirentes();
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">PayQuick Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Adquirentes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Configurações de Adquirentes</h1>
            <p className="text-sm text-muted-foreground">
              Configure as integrações com os gateways de pagamento.
            </p>
          </div>

          {loading ? (
            <Card className="p-4">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PrimePag */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">PrimePag</h2>
                    <p className="text-sm text-muted-foreground">
                      Configurações do gateway PrimePag
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="primepag-status">Status</Label>
                    <Switch
                      id="primepag-status"
                      checked={adquirente?.primepag_status === AdquirenteStatus.ACTIVE}
                      onCheckedChange={(checked) =>
                        setAdquirente(prev => ({
                          ...prev!,
                          primepag_status: checked ? AdquirenteStatus.ACTIVE : AdquirenteStatus.INACTIVE
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primepag-uri">URI Base</Label>
                    <Input
                      id="primepag-uri"
                      value={adquirente?.primepag_uri || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, primepag_uri: e.target.value }))}
                      placeholder="https://api.primepag.com.br"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="primepag-ci">Client ID</Label>
                    <Input
                      id="primepag-ci"
                      value={adquirente?.primepag_ci || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, primepag_ci: e.target.value }))}
                      placeholder="Seu Client ID do PrimePag"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="primepag-cs">Client Secret</Label>
                    <Input
                      id="primepag-cs"
                      type="password"
                      value={adquirente?.primepag_cs || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, primepag_cs: e.target.value }))}
                      placeholder="Seu Client Secret do PrimePag"
                    />
                  </div>
                </div>
              </Card>

              {/* Zendry */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Zendry</h2>
                    <p className="text-sm text-muted-foreground">
                      Configurações do gateway Zendry
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="zendry-status">Status</Label>
                    <Switch
                      id="zendry-status"
                      checked={adquirente?.zendry_status === AdquirenteStatus.ACTIVE}
                      onCheckedChange={(checked) =>
                        setAdquirente(prev => ({
                          ...prev!,
                          zendry_status: checked ? AdquirenteStatus.ACTIVE : AdquirenteStatus.INACTIVE
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="zendry-uri">URI Base</Label>
                    <Input
                      id="zendry-uri"
                      value={adquirente?.zendry_uri || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, zendry_uri: e.target.value }))}
                      placeholder="https://api.zendry.com.br"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="zendry-ci">Client ID</Label>
                    <Input
                      id="zendry-ci"
                      value={adquirente?.zendry_ci || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, zendry_ci: e.target.value }))}
                      placeholder="Seu Client ID do Zendry"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="zendry-cs">Client Secret</Label>
                    <Input
                      id="zendry-cs"
                      type="password"
                      value={adquirente?.zendry_cs || ""}
                      onChange={(e) => setAdquirente(prev => ({ ...prev!, zendry_cs: e.target.value }))}
                      placeholder="Seu Client Secret do Zendry"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
