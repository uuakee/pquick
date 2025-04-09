import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Verificar se o usuário é admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    // Buscar estatísticas de usuários
    const userStats = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const totalUsers = userStats.reduce((acc, stat) => acc + stat._count.id, 0);
    const activeUsers = userStats.find(stat => stat.status === "ACTIVE")?._count.id || 0;
    const blockedUsers = userStats.find(stat => stat.status === "BLOCKED")?._count.id || 0;

    // Buscar estatísticas de transações
    const totalTransactions = await prisma.transaction.count();
    const totalVolume = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      }
    });
    const totalInfractions = await prisma.transaction.count({
      where: {
        status: "INFRACTION"
      }
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers
      },
      transactions: {
        total: totalTransactions,
        volume: totalVolume._sum.amount || 0,
        infractions: totalInfractions
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 