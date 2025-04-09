"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
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
import { UserLevelBadge } from "@/components/user-level-badge";
import { useUser } from "@/hooks/useUser";
import { TransferDialog } from "@/components/transfer-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  amount: number;
  status: string;
  type: string;
  description: string | null;
  createdAt: string;
  senderId: number;
  receiverId: number;
  sender: {
    username: string;
    name: string;
  };
  receiver: {
    username: string;
    name: string;
  };
}

const statusConfig = {
  COMPLETED: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Concluída"
  },
  PENDING: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Pendente"
  },
  FAILED: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Falhou"
  }
};

export default function TransferenciasPage() {
  const { user, isLoading: isLoadingUser } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar transações");
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
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
                  <BreadcrumbPage>Transferências</BreadcrumbPage>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Transferências</h1>
              <p className="text-sm text-muted-foreground">
                Visualize todas as transferências em andamento e concluídas na sua operação.
              </p>
            </div>
            <TransferDialog
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Transferência
                </Button>
              }
            />
          </div>

          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma transferência encontrada.
                </p>
              </Card>
            ) : (
              transactions.map((transaction) => {
                const status = statusConfig[transaction.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                const isReceived = transaction.receiverId === user?.id;

                return (
                  <Card key={transaction.id} className="p-4 transition-colors hover:bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-full", status.bgColor)}>
                          <StatusIcon className={cn("h-4 w-4", status.color)} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {transaction.type === "TRANSFER" ? "Transferência" : transaction.type}
                            </p>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              status.bgColor,
                              status.color
                            )}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description || "Sem descrição"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(transaction.createdAt).toLocaleDateString("pt-BR")}</span>
                            <span>•</span>
                            <span>{new Date(transaction.createdAt).toLocaleTimeString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className={cn(
                          "font-medium text-lg",
                          isReceived ? "text-green-500" : "text-red-500"
                        )}>
                          {isReceived ? "+" : "-"}{formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">{transaction.sender.name}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span className="font-medium">{transaction.receiver.name}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 