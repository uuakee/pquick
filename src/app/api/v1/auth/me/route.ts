import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        totalRevenue: true,
        monthlyRevenue: true,
        transactionCount: true,
        lastLevelUpdate: true,
        wallet: {
          select: {
            balance: true,
            blocked_balance: true,
            available_balance: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[AUTH_ME]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 