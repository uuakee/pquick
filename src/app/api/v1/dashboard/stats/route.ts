import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // Buscar carteira do usuário
    const wallet = await prisma.wallet.findUnique({
      where: { userId: decoded.userId }
    });

    if (!wallet) {
      return new NextResponse("Carteira não encontrada", { status: 404 });
    }

    // Buscar todas as transações do último mês
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Todas as transações (para total e contagem)
    const allTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId }
        ],
        createdAt: {
          gte: lastMonth
        }
      }
    });

    // Apenas transações de depósito (para ticket médio e média diária)
    const depositTransactions = await prisma.transaction.findMany({
      where: {
        receiverId: decoded.userId,
        type: "DEPOSIT",
        createdAt: {
          gte: lastMonth
        }
      }
    });

    // Calcular total de todas as transações
    const totalTransactions = allTransactions.reduce((acc, tx) => {
      // Soma o valor absoluto de todas as transações, independente de ser enviada ou recebida
      return acc + Math.abs(tx.amount);
    }, 0);

    // Calcular estatísticas apenas para depósitos
    const totalDeposits = depositTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const ticketMedio = depositTransactions.length > 0 
      ? totalDeposits / depositTransactions.length 
      : 0;

    // Calcular média diária de depósitos
    const hoje = new Date();
    const diasNoMes = Math.ceil((hoje.getTime() - lastMonth.getTime()) / (1000 * 60 * 60 * 24));
    const mediaDiaria = totalDeposits / diasNoMes;

    const stats = {
      wallet: {
        balance: wallet.balance,
        blocked_balance: wallet.blocked_balance,
        available_balance: wallet.available_balance,
      },
      stats: {
        total_transactions: totalTransactions,
        transaction_count: allTransactions.length,
        ticket_medio: ticketMedio,
        media_diaria: mediaDiaria,
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
} 