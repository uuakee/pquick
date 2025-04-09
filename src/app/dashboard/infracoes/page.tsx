"use client";

import { useState, useEffect } from "react";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Eye, AlertTriangle, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { UserLevelBadge } from "@/components/user-level-badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: number;
  amount: number;
  status: string;
  type: string;
  description: string | null;
  createdAt: string;
  metadata: any;
  senderId: number;
  receiverId: number;
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
  INFRACTION: {
    label: "Infração",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle
  },
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

export default function InfracoesPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInfractions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/transactions?status=INFRACTION", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar infrações");
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar infrações:", error);
        toast.error("Erro ao carregar infrações");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfractions();
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
                  <BreadcrumbPage>Infrações</BreadcrumbPage>
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
              <h1 className="text-2xl font-semibold">Infrações</h1>
              <p className="text-sm text-muted-foreground">
                Visualize todas as infrações em andamento e concluídas na sua operação.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Infrações</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma infração encontrada.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const isReceived = transaction.receiverId === user?.id;
                      const transactionUser = isReceived ? transaction.sender : transaction.receiver;

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleTimeString("pt-BR")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">
                                {transaction.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{transactionUser.name}</span>
                              <span className="text-xs text-muted-foreground">
                                @{transactionUser.username}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Infração</DialogTitle>
                                  <DialogDescription>
                                    Informações detalhadas sobre a infração.
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Tipo</span>
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-500" />
                                      <span className="text-sm font-medium">
                                        {transaction.type}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Valor</span>
                                    <span className="text-lg font-bold">
                                      {formatCurrency(transaction.amount)}
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">
                                      {isReceived ? "Remetente" : "Destinatário"}
                                    </span>
                                    <div className="rounded-lg border p-3">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{transactionUser.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                          @{transactionUser.username}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Data e Hora</span>
                                    <div className="rounded-lg border p-3">
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {new Date(transaction.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {new Date(transaction.createdAt).toLocaleTimeString("pt-BR")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {transaction.description && (
                                    <div className="space-y-2">
                                      <span className="text-sm text-muted-foreground">Motivo</span>
                                      <div className="rounded-lg border p-3">
                                        <p className="text-sm">{transaction.description}</p>
                                      </div>
                                    </div>
                                  )}

                                  {transaction.metadata && (
                                    <div className="space-y-2">
                                      <span className="text-sm text-muted-foreground">Detalhes Adicionais</span>
                                      <div className="rounded-lg border p-3">
                                        <pre className="text-sm whitespace-pre-wrap">
                                          {JSON.stringify(transaction.metadata, null, 2)}
                                        </pre>
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