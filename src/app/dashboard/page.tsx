"use client";

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { 
  CheckCircle, 
  XCircle, 
  CircleDollarSign,
  SigmaSquare,
  Hash,
  Ticket,
  Users,
  Loader2
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image";
import { UserLevelBadge } from "@/components/user-level-badge";
import { UserLevel } from "@prisma/client";

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  variant?: "default" | "success" | "danger" | "warning" | "info"
  isLoading?: boolean
}

function StatCard({ icon, value, label, variant = "default", isLoading = false }: StatCardProps) {
  const variantStyles = {
    default: "bg-card text-card-foreground",
    success: "bg-emerald-500/10 text-emerald-500",
    danger: "bg-red-500/10 text-red-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    info: "bg-blue-500/10 text-blue-500",
  }

  const iconStyles = {
    default: "bg-muted/50",
    success: "bg-emerald-500/20",
    danger: "bg-red-500/20",
    warning: "bg-yellow-500/20",
    info: "bg-blue-500/20",
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-2 ${iconStyles[variant]}`}>
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : icon}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold tracking-tight">
            {isLoading ? "-" : value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

interface DashboardStats {
  wallet: {
    balance: number;
    blocked_balance: number;
    available_balance: number;
  };
  stats: {
    total_transactions: number;
    transaction_count: number;
    ticket_medio: number;
    media_diaria: number;
  };
}

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.BRONZE);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.level) {
      setUserLevel(user.level as UserLevel);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/dashboard/stats", {
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
          throw new Error("Erro ao carregar estatísticas");
        }

        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar estatísticas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
                  <BreadcrumbLink href="#">
                    PayQuick
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <UserLevelBadge level={userLevel} monthlyRevenue={stats?.wallet?.balance || 0} />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Cards de Saldo */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<CheckCircle className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.wallet.balance || 0)}
              label="Saldo Total"
              variant="info"
              isLoading={isLoading}
            />
            <StatCard
              icon={<XCircle className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.wallet.blocked_balance || 0)}
              label="Saldo Bloqueado"
              variant="danger"
              isLoading={isLoading}
            />
            <StatCard
              icon={<CircleDollarSign className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.wallet.available_balance || 0)}
              label="Saldo Disponível"
              variant="success"
              isLoading={isLoading}
            />
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              icon={<SigmaSquare className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.stats.total_transactions || 0)}
              label="Total Transações"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Hash className="h-6 w-6" />}
              value={isLoading ? "-" : String(stats?.stats.transaction_count || 0)}
              label="Qtd Transações"
              variant="success"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Ticket className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.stats.ticket_medio || 0)}
              label="Ticket Médio"
              variant="info"
              isLoading={isLoading}
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              value={isLoading ? "-" : formatCurrency(stats?.stats.media_diaria || 0)}
              label="Média Diária"
              variant="success"
              isLoading={isLoading}
            />
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
