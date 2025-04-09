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
  DialogTrigger,
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
  Eye,
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserLevelBadge } from "@/components/user-level-badge";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Deposit {
  id: number;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  metadata: any;
  sender: {
    name: string;
    username: string;
  };
  receiver: {
    name: string;
    username: string;
  };
}

const statusConfig = {
  COMPLETED: {
    label: "Concluído",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle2
  },
  PENDING: {
    label: "Pendente",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: Clock
  },
  FAILED: {
    label: "Falhou",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle
  }
};

export default function CobrancasPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/transactions?types=DEPOSIT", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar cobranças");
        }

        const data = await response.json();
        setDeposits(data);
      } catch (error) {
        console.error("Erro ao carregar cobranças:", error);
        toast.error("Erro ao carregar cobranças");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeposits();
  }, []);

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
                  <BreadcrumbPage>Cobranças</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingUser ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UserLevelBadge 
                level={user?.level || "BRONZE"} 
                monthlyRevenue={user?.wallet?.balance || 0} 
              />
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Cobranças</h1>
              <p className="text-sm text-muted-foreground">
                Visualize todas as cobranças recebidas e pendentes.
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Cobranças</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : deposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma cobrança encontrada.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagador</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits.map((deposit) => {
                      const status = statusConfig[deposit.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(deposit.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(deposit.createdAt).toLocaleTimeString("pt-BR")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className={cn("h-4 w-4", status.color)} />
                              <span className={cn("text-sm font-medium", status.color)}>
                                {status.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{deposit.sender.name}</span>
                              <span className="text-xs text-muted-foreground">
                                @{deposit.sender.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(deposit.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedDeposit(deposit)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Cobrança</DialogTitle>
                                  <DialogDescription>
                                    Informações detalhadas sobre a cobrança.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className={cn("h-4 w-4", status.color)} />
                                      <span className={cn("text-sm font-medium", status.color)}>
                                        {status.label}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Valor</span>
                                    <span className="text-lg font-bold">
                                      {formatCurrency(deposit.amount)}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Pagador</span>
                                    <div className="rounded-lg border p-3">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{deposit.sender.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                          @{deposit.sender.username}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Data e Hora</span>
                                    <div className="rounded-lg border p-3">
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {new Date(deposit.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {new Date(deposit.createdAt).toLocaleTimeString("pt-BR")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {deposit.description && (
                                    <div className="space-y-2">
                                      <span className="text-sm text-muted-foreground">Descrição</span>
                                      <div className="rounded-lg border p-3">
                                        <p className="text-sm">{deposit.description}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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