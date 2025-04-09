import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { checkAndUpdateUserLevel } from '@/lib/gamification';
import { verifyToken } from "@/lib/auth";
import { TransactionType, TransactionStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, receiverId, type, description } = body;

    if (!amount || !receiverId || !type) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Criar transação
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        status: 'COMPLETED',
        senderId: auth.userId,
        receiverId,
      },
    });

    // Verificar e atualizar nível do usuário receptor
    const levelUpdate = await checkAndUpdateUserLevel(receiverId);

    // Se houve upgrade de nível, incluir na resposta
    return NextResponse.json({
      transaction,
      levelUpdate: levelUpdate ? {
        message: `Parabéns! Você alcançou o nível ${levelUpdate.newLevel}!`,
        ...levelUpdate
      } : null
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const url = new URL(request.url);
    const types = url.searchParams.get("types")?.split(",") as TransactionType[] | null;
    const statusParam = url.searchParams.get("status");
    const status = statusParam ? (statusParam as TransactionStatus) : null;
    
    if (!token) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return new NextResponse("Token inválido", { status: 401 });
    }

    // Buscar todas as transações do usuário (enviadas e recebidas)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId }
        ],
        ...(types && { type: { in: types } }), // Filtrar por múltiplos tipos
        ...(status && { status }) // Filtrar por status
      },
      include: {
        sender: {
          select: {
            username: true,
            name: true
          }
        },
        receiver: {
          select: {
            username: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_LIST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 