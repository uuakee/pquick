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

    // Obter parâmetros de filtro
    const url = new URL(request.url);
    const types = url.searchParams.get("types")?.split(",").filter(Boolean) || [];
    const status = url.searchParams.get("status")?.split(",").filter(Boolean) || [];

    // Construir query
    const where: any = {};
    if (types.length > 0) {
      where.type = { in: types };
    }
    if (status.length > 0) {
      where.status = { in: status };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { username: true }
        },
        receiver: {
          select: { username: true }
        }
      }
    });

    // Formatar resposta
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      metadata: {
        ...(transaction.metadata as object || {}),
        senderUsername: transaction.sender?.username,
        receiverUsername: transaction.receiver?.username
      }
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("[ADMIN_TRANSACTIONS]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 