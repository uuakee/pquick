import * as React from "react"
import {
  Home,
  Key,
  Bell,
  ArrowLeftRight,
  FileText,
  ScrollText,
  AlertTriangle,
  QrCode,
  Wallet,
  LogOut,
} from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Space_Grotesk } from "next/font/google"
import { useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const menuData = {
  sections: [
    {
      title: "DASHBOARDS",
      items: [
        {
          title: "Principal",
          icon: <Home className="h-4 w-4" />,
          url: "/dashboard",
        },
      ],
    },
    {
      title: "GESTÃO",
      items: [
        {
          title: "Credenciais",
          icon: <Key className="h-4 w-4" />,
          url: "/dashboard/credenciais",
        },
        {
          title: "Webhooks",
          icon: <Bell className="h-4 w-4" />,
          url: "/dashboard/webhooks",
        },
      ],
    },
    {
      title: "FINANCEIRO",
      items: [
        {
          title: "Transferências Internas",
          icon: <ArrowLeftRight className="h-4 w-4" />,
          url: "/dashboard/transferencias",
        },
        {
          title: "Cobranças",
          icon: <FileText className="h-4 w-4" />,
          url: "/dashboard/cobrancas",
        },
        {
          title: "Extrato",
          icon: <ScrollText className="h-4 w-4" />,
          url: "/dashboard/extrato",
        },
        {
          title: "Infrações",
          icon: <AlertTriangle className="h-4 w-4" />,
          url: "/dashboard/infracoes",
        },
      ],
    },
    {
      title: "PIX",
      items: [
        {
          title: "Qr Codes",
          icon: <QrCode className="h-4 w-4" />,
          url: "/dashboard/qrcodes",
        },
        {
          title: "Pagamentos",
          icon: <Wallet className="h-4 w-4" />,
          url: "/dashboard/pagamentos",
        },
      ],
    },
  ],
}

interface User {
  name: string;
  email: string;
  username: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("/dashboard")
  const [user, setUser] = React.useState<User | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
    }
  }, [])

  React.useEffect(() => {
    // Atualiza o item ativo baseado na URL atual
    const pathname = window.location.pathname
    setActiveItem(pathname)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className={spaceGrotesk.className}>
      <Sidebar {...props} className="border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarHeader className="border-b border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard" className="relative">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f25100] to-[#ff6b1a] shadow-lg">
                    <Image 
                      src="/plataform/logo-collapse.svg" 
                      alt="PayQuick" 
                      width={20} 
                      height={20}
                      className="drop-shadow"
                    />
                    <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 transition-opacity hover:opacity-100" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold tracking-tight line-clamp-1">
                      {user?.name || "PayQuick"}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      PayQuick v1.0
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {menuData.sections.map((section, index) => (
                <React.Fragment key={section.title}>
                  <SidebarMenuItem>
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-medium text-muted-foreground/70">
                        {section.title}
                      </h4>
                    </div>
                  </SidebarMenuItem>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        onClick={() => setActiveItem(item.url)}
                      >
                        <a 
                          href={item.url} 
                          className={cn(
                            "group relative flex items-center gap-3 transition-colors",
                            activeItem === item.url && "text-[#f25100]"
                          )}
                        >
                          <motion.div
                            initial={false}
                            animate={{
                              backgroundColor: activeItem === item.url ? "rgba(242, 81, 0, 0.1)" : "transparent",
                            }}
                            className="absolute inset-0 rounded-md"
                          />
                          <motion.div
                            initial={false}
                            animate={{
                              color: activeItem === item.url ? "#f25100" : "currentColor",
                            }}
                            className="relative"
                          >
                            {item.icon}
                          </motion.div>
                          <span className="relative">{item.title}</span>
                          {activeItem === item.url && (
                            <motion.div
                              layoutId="activeItem"
                              className="absolute -left-3 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-[#f25100]"
                            />
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail className="border-r border-border/50" />
      </Sidebar>
    </div>
  )
}
