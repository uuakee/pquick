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
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!admin || admin.role !== "ADMIN") {
      return new NextResponse("Acesso negado", { status: 403 });
    }

    // Buscar todos os usuários exceto o admin atual
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: decoded.userId // Excluir o admin atual da lista
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        level: true,
        totalRevenue: true,
        monthlyRevenue: true,
        transactionCount: true,
        createdAt: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Log para debug
    console.log("[ADMIN_USERS_LIST] Total users found:", users.length);

    return NextResponse.json(users);
  } catch (error) {
    console.error("[ADMIN_USERS_LIST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 