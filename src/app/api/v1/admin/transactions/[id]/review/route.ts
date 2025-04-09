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
    const { approved, note } = body;

    if (typeof approved !== "boolean" || !note) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Buscar transação
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

    if (transaction.status !== "INFRACTION") {
      return new NextResponse("Transação não está marcada como suspeita", { status: 400 });
    }

    // Atualizar transação baseado na decisão
    if (approved) {
      // Se aprovada, completar a transação
      await prisma.$transaction(async (tx) => {
        if (transaction.type === "TRANSFER" && transaction.sender && transaction.receiver) {
          // Primeiro, devolver o valor bloqueado para available_balance
          await tx.wallet.update({
            where: { userId: transaction.sender.id },
            data: {
              blocked_balance: {
                decrement: transaction.amount
              },
              available_balance: {
                increment: transaction.amount
              }
            }
          });

          // Depois, realizar a transferência
          await tx.wallet.update({
            where: { userId: transaction.sender.id },
            data: {
              balance: {
                decrement: transaction.amount
              },
              available_balance: {
                decrement: transaction.amount
              }
            }
          });

          await tx.wallet.update({
            where: { userId: transaction.receiver.id },
            data: {
              balance: {
                increment: transaction.amount
              },
              available_balance: {
                increment: transaction.amount
              }
            }
          });
        }

        // Atualizar transação
        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "COMPLETED",
            metadata: {
              ...transaction.metadata as any,
              review: {
                approved: true,
                note,
                date: new Date().toISOString(),
                adminId: decoded.userId
              }
            }
          }
        });
      });
    } else {
      // Se negada, devolver o valor bloqueado e marcar como falha
      await prisma.$transaction(async (tx) => {
        if (transaction.type === "TRANSFER" && transaction.sender) {
          await tx.wallet.update({
            where: { userId: transaction.sender.id },
            data: {
              blocked_balance: {
                decrement: transaction.amount
              },
              available_balance: {
                increment: transaction.amount
              }
            }
          });
        }

        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "FAILED",
            metadata: {
              ...transaction.metadata as any,
              review: {
                approved: false,
                note,
                date: new Date().toISOString(),
                adminId: decoded.userId
              }
            }
          }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_TRANSACTION_REVIEW]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 