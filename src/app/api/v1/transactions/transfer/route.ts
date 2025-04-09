import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    const body = await request.json();
    const { username, amount, description } = body;

    if (!username || !amount || amount <= 0) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }

    // Buscar usuário destinatário
    const receiver = await prisma.user.findUnique({
      where: { username },
      include: { wallet: true }
    });

    if (!receiver) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    // Buscar usuário remetente
    const sender = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { wallet: true }
    });

    if (!sender?.wallet) {
      return new NextResponse("Erro ao buscar carteira", { status: 500 });
    }

    // Verificar saldo
    if (sender.wallet.available_balance < amount) {
      return new NextResponse("Saldo insuficiente", { status: 400 });
    }

    // Iniciar transação
    const transaction = await prisma.$transaction(async (tx) => {
      // Atualizar carteiras
      await tx.wallet.update({
        where: { userId: sender.id },
        data: {
          balance: {
            decrement: amount
          },
          available_balance: {
            decrement: amount
          }
        }
      });

      await tx.wallet.update({
        where: { userId: receiver.id },
        data: {
          balance: {
            increment: amount
          },
          available_balance: {
            increment: amount
          }
        }
      });

      // Criar registro da transação
      return await tx.transaction.create({
        data: {
          amount,
          type: "TRANSFER",
          status: "COMPLETED",
          description,
          senderId: sender.id,
          receiverId: receiver.id,
          metadata: {
            senderUsername: sender.username,
            receiverUsername: receiver.username,
          },
        },
      });
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSFER]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 