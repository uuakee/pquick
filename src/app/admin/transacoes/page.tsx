"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

type TransactionType = "DEPOSIT" | "PAYMENT" | "TRANSFER" | "WITHDRAWAL";
type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "FLAGGED";

interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  metadata: {
    senderUsername?: string;
    receiverUsername?: string;
    infraction?: {
      reason: string;
      date: string;
      adminId: number;
    };
  };
}

export default function AdminTransacoesPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [infractionReason, setInfractionReason] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/dashboard");
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchTransactions();
  }, [selectedType, selectedStatus]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const types = selectedType === "all" ? [] : [selectedType];
      const status = selectedStatus === "all" ? [] : [selectedStatus];
      
      const response = await fetch(
        `/api/v1/admin/transactions?types=${types.join(",")}&status=${status.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (transactionId: number, newStatus: TransactionStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/admin/transactions/${transactionId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success("Status atualizado com sucesso");
        fetchTransactions();
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleFlagTransaction = async () => {
    if (!selectedTransaction || !infractionReason) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/admin/transactions/${selectedTransaction.id}/flag`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: infractionReason }),
      });

      if (response.ok) {
        toast.success("Transação marcada como suspeita");
        setInfractionReason("");
        setSelectedTransaction(null);
        fetchTransactions();
      } else {
        toast.error("Erro ao marcar transação");
      }
    } catch (error) {
      console.error("Erro ao marcar transação:", error);
      toast.error("Erro ao marcar transação");
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownIcon className="w-4 h-4 text-green-500" />;
      case "WITHDRAWAL":
        return <ArrowUpIcon className="w-4 h-4 text-red-500" />;
      case "TRANSFER":
        return <RefreshCwIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <RefreshCwIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "FLAGGED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  <BreadcrumbPage>Transações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Gerenciar Transações</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie todas as transações do sistema.
              </p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="DEPOSIT">Depósitos</SelectItem>
                  <SelectItem value="WITHDRAWAL">Saques</SelectItem>
                  <SelectItem value="TRANSFER">Transferências</SelectItem>
                  <SelectItem value="PAYMENT">Pagamentos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="FLAGGED">Suspeita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4">
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
            ) : transactions.length === 0 ? (
              <Card className="p-6 text-center text-gray-500">
                Nenhuma transação encontrada
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">
                          {transaction.type === "TRANSFER"
                            ? `Transferência ${
                                transaction.metadata?.senderUsername
                                  ? "para"
                                  : "de"
                              } ${
                                transaction.metadata?.senderUsername ||
                                transaction.metadata?.receiverUsername
                              }`
                            : transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {transaction.metadata?.infraction && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-orange-600">
                            <AlertTriangleIcon className="w-4 h-4" />
                            <span>{transaction.metadata.infraction.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gerenciar Transação</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Alterar Status</h4>
                              <Select
                                value={transaction.status}
                                onValueChange={(value) => 
                                  handleStatusChange(transaction.id, value as TransactionStatus)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pendente</SelectItem>
                                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                                  <SelectItem value="FAILED">Falhou</SelectItem>
                                  <SelectItem value="FLAGGED">Suspeita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Marcar Infração</h4>
                              <Textarea
                                placeholder="Descreva o motivo da infração..."
                                value={infractionReason}
                                onChange={(e) => setInfractionReason(e.target.value)}
                              />
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={handleFlagTransaction}
                                disabled={!infractionReason}
                              >
                                Marcar como Suspeita
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Detalhes da Transação</h4>
                              <div className="rounded-lg bg-muted p-4 space-y-2">
                                <p>ID: {transaction.id}</p>
                                <p>Tipo: {transaction.type}</p>
                                <p>Valor: {formatCurrency(transaction.amount)}</p>
                                <p>Status: {transaction.status}</p>
                                <p>Data: {new Date(transaction.createdAt).toLocaleString("pt-BR")}</p>
                                {transaction.metadata?.senderUsername && (
                                  <p>Remetente: {transaction.metadata.senderUsername}</p>
                                )}
                                {transaction.metadata?.receiverUsername && (
                                  <p>Destinatário: {transaction.metadata.receiverUsername}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
