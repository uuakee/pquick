"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2,
  AlertTriangle,
  Ban,
  CheckCircle2
} from "lucide-react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  username: string;
  status: "ACTIVE" | "INACTIVE" | "BLOCKED";
  level: string;
  totalRevenue: number;
  monthlyRevenue: number;
  transactionCount: number;
  createdAt: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/dashboard");
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Erro ao carregar usuários");
        }

        const data = await response.json();
        console.log("Usuários carregados:", data);
        setUsers(data);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error(error instanceof Error ? error.message : "Erro ao carregar usuários");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user]);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao atualizar status");
      }

      const updatedUser = await response.json();
      console.log("Usuário atualizado:", updatedUser);

      setUsers(users.map(u => 
        u.id === userId ? { ...u, status: newStatus as "ACTIVE" | "INACTIVE" | "BLOCKED" } : u
      ));

      toast.success("Status atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                  <BreadcrumbPage>Usuários</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Usuários</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie os usuários do sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou username..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ACTIVE">Ativos</SelectItem>
                <SelectItem value="INACTIVE">Inativos</SelectItem>
                <SelectItem value="BLOCKED">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário encontrado.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Transações</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-sm text-muted-foreground">
                              @{user.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.status === "ACTIVE" ? (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            ) : user.status === "BLOCKED" ? (
                              <ShieldAlert className="h-4 w-4 text-red-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              user.status === "ACTIVE" && "text-green-500",
                              user.status === "BLOCKED" && "text-red-500",
                              user.status === "INACTIVE" && "text-yellow-500"
                            )}>
                              {user.status === "ACTIVE" ? "Ativo" :
                               user.status === "BLOCKED" ? "Bloqueado" : "Inativo"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{user.level}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{user.transactionCount}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {formatCurrency(user.totalRevenue)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {user.status === "ACTIVE" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(user.id, "BLOCKED")}
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(user.id, "ACTIVE")}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
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
      </SidebarInset>
    </SidebarProvider>
  );
} 