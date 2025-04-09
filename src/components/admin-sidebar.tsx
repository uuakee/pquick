import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarFooter } from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  CreditCard, 
  ShieldAlert,
  LogOut,
  Settings
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Usuários",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Transações",
    href: "/admin/transacoes",
    icon: CreditCard,
  },
  {
    title: "Infrações",
    href: "/admin/infracoes",
    icon: AlertTriangle,
  },
  {
    title: "Segurança",
    href: "/admin/seguranca",
    icon: ShieldAlert,
  },
  {
    title: "Adquirentes",
    href: "/admin/adquirentes",
    icon: CreditCard,
  },
  {
    title: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <Sidebar>
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-xl">PayQuick</span>
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-1 p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
} 