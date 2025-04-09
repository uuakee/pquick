import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const { id } = params;
    const transactionId = parseInt(id);
    if (isNaN(transactionId)) {
      return new NextResponse("ID inválido", { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return new NextResponse("Motivo é obrigatório", { status: 400 });
    }

    // Buscar transação com detalhes do usuário
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sender: {
          include: { wallet: true }
        },
        receiver: {
          include: { wallet: true }
        }
      }
    });

    if (!transaction) {
      return new NextResponse("Transação não encontrada", { status: 404 });
    }

    // Atualizar transação e carteira em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Se for transferência, bloquear o valor na carteira do remetente
      if (transaction.type === "TRANSFER" && transaction.sender?.wallet) {
        const wallet = transaction.sender.wallet;
        
        // Verificar se tem saldo disponível
        if (wallet.available_balance >= transaction.amount) {
          await tx.wallet.update({
            where: { userId: transaction.sender.id },
            data: {
              available_balance: {
                decrement: transaction.amount
              },
              blocked_balance: {
                increment: transaction.amount
              }
            }
          });
        }
      }

      // Atualizar status da transação
      return await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "INFRACTION",
          metadata: {
            infraction: {
              reason,
              date: new Date().toISOString(),
              adminId: decoded.userId
            }
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ADMIN_TRANSACTION_FLAG]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 