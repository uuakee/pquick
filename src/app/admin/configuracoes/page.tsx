"use client";

import { useEffect, useState, useRef } from "react";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { HexColorPicker } from "react-colorful";
import { ImageIcon, Loader2, SaveIcon } from "lucide-react";
import Image from "next/image";

interface Platform {
  id: number;
  name: string;
  url: string;
  logo_url: string;
  color: string;
  description: string;
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/dashboard");
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchPlatform();
  }, []);

  const fetchPlatform = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/v1/admin/platform", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlatform(data);
        if (data.logo_url) {
          setPreviewUrl(data.logo_url);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error("Arquivo muito grande. Máximo 5MB.");
        return;
      }

      if (!["image/svg+xml", "image/png", "image/jpeg"].includes(file.type)) {
        toast.error("Formato não suportado. Use SVG, PNG ou JPG.");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("name", platform.name);
      formData.append("url", platform.url);
      formData.append("color", platform.color);
      formData.append("description", platform.description);
      
      if (selectedFile) {
        formData.append("logo", selectedFile);
      }

      const response = await fetch("/api/v1/admin/platform", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success("Configurações salvas com sucesso");
        fetchPlatform();
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
                  <BreadcrumbPage>Configurações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Configurações da Plataforma</h1>
            <p className="text-sm text-muted-foreground">
              Personalize a aparência e configurações gerais do gateway.
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
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Plataforma</Label>
                    <Input
                      id="name"
                      value={platform?.name || ""}
                      onChange={(e) => setPlatform(prev => ({ ...prev!, name: e.target.value }))}
                      placeholder="Ex: PayQuick Gateway"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="url">URL da Plataforma</Label>
                    <Input
                      id="url"
                      value={platform?.url || ""}
                      onChange={(e) => setPlatform(prev => ({ ...prev!, url: e.target.value }))}
                      placeholder="Ex: https://gateway.payquick.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição da Plataforma</Label>
                    <Input
                      id="description"
                      value={platform?.description || ""}
                      onChange={(e) => setPlatform(prev => ({ ...prev!, description: e.target.value }))}
                      placeholder="Ex: Sua solução completa para pagamentos online"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Cor Principal</Label>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg cursor-pointer border"
                        style={{ backgroundColor: platform?.color }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      />
                      <Input
                        value={platform?.color || ""}
                        onChange={(e) => setPlatform(prev => ({ ...prev!, color: e.target.value }))}
                        placeholder="#000000"
                        className="w-32"
                      />
                    </div>
                    {showColorPicker && (
                      <div ref={colorPickerRef} className="absolute mt-2 p-2 bg-white rounded-lg shadow-lg border z-50">
                        <HexColorPicker
                          color={platform?.color}
                          onChange={(color) => setPlatform(prev => ({ ...prev!, color }))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Logo da Plataforma</Label>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {previewUrl ? (
                          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                            <Image
                              src={previewUrl}
                              alt="Logo Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-muted">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label
                          htmlFor="logo-upload"
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full cursor-pointer"
                        >
                          Escolher Arquivo
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          SVG, PNG ou JPG (max. 5MB)
                        </p>
                      </div>
                    </div>
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
