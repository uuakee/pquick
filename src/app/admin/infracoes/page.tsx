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
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
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

export default function InfracoesPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      if (!isLoading && (!user || user.role !== "ADMIN")) {
        router.push("/dashboard");
      }
    };

    checkAdmin();
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchInfractions();
  }, []);

  const fetchInfractions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/v1/admin/transactions?status=INFRACTION", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar infrações:", error);
      toast.error("Erro ao carregar infrações");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewTransaction = async (transactionId: number, approved: boolean) => {
    if (!reviewNote) {
      toast.error("Adicione uma nota de revisão");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/v1/admin/transactions/${transactionId}/review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          note: reviewNote,
        }),
      });

      if (response.ok) {
        toast.success(approved ? "Transação aprovada" : "Transação negada");
        setReviewNote("");
        setSelectedTransaction(null);
        fetchInfractions();
      } else {
        toast.error("Erro ao revisar transação");
      }
    } catch (error) {
      console.error("Erro ao revisar transação:", error);
      toast.error("Erro ao revisar transação");
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
                  <BreadcrumbPage>Infrações</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Infrações</h1>
            <p className="text-sm text-muted-foreground">
              Revise e tome ações em transações marcadas como suspeitas.
            </p>
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
                Nenhuma infração encontrada
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium">
                          Transação #{transaction.id} - {formatCurrency(transaction.amount)}
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
                        <div className="flex items-center gap-1 mt-1 text-sm text-orange-600">
                          <span>Motivo: {transaction.metadata.infraction?.reason}</span>
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          Revisar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Revisar Infração</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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

                          <div className="space-y-2">
                            <h4 className="font-medium">Motivo da Infração</h4>
                            <div className="rounded-lg bg-orange-50 p-4 text-orange-800">
                              {transaction.metadata.infraction?.reason}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Nota de Revisão</h4>
                            <Textarea
                              placeholder="Adicione uma nota explicando sua decisão..."
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              className="flex-1"
                              onClick={() => handleReviewTransaction(transaction.id, true)}
                              disabled={!reviewNote}
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button 
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleReviewTransaction(transaction.id, false)}
                              disabled={!reviewNote}
                            >
                              <XCircleIcon className="w-4 h-4 mr-2" />
                              Negar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
