import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    wallet: true;
    sentTransactions: true;
    receivedTransactions: true;
  }
}>;

export async function GET(req: Request) {
  try {
    // Autenticar requisição
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar dados do usuário e carteira
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        wallet: true,
        sentTransactions: true,
        receivedTransactions: true,
      }
    }) as UserWithRelations | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Juntar todas as transações
    const allTransactions = [
      ...user.sentTransactions,
      ...user.receivedTransactions
    ];

    // Calcular estatísticas
    const totalTransactions = allTransactions.reduce(
      (sum, tx) => sum + (tx.amount || 0),
      0
    );

    const transactionCount = allTransactions.length;

    const ticketMedio = transactionCount > 0
      ? totalTransactions / transactionCount
      : 0;

    // Calcular média diária (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = allTransactions.filter(
      tx => new Date(tx.createdAt) > sevenDaysAgo
    );

    const mediaDiaria = recentTransactions.length > 0
      ? recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0) / 7
      : 0;

    // Retornar estatísticas
    return NextResponse.json({
      wallet: {
        balance: user.wallet?.balance || 0,
        blocked_balance: user.wallet?.blocked_balance || 0,
        available_balance: user.wallet?.available_balance || 0,
      },
      stats: {
        total_transactions: totalTransactions,
        transaction_count: transactionCount,
        ticket_medio: ticketMedio,
        media_diaria: mediaDiaria,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 