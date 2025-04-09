import { prisma } from './prisma';
import { UserLevel } from '@prisma/client';

export const LEVEL_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 10000,     // R$ 10.000
  GOLD: 50000,       // R$ 50.000
  PLATINUM: 100000,  // R$ 100.000
  CHALLENGER: 500000 // R$ 500.000
} as const;

export const LEVEL_BADGES = {
  BRONZE: '/levels/bronze.svg',
  SILVER: '/levels/prata.svg',
  GOLD: '/levels/ouro.svg',
  PLATINUM: '/levels/platina.svg',
  CHALLENGER: '/levels/challenger.svg'
} as const;

export const LEVEL_COLORS = {
  BRONZE: 'text-orange-600',
  SILVER: 'text-gray-400',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-blue-400',
  CHALLENGER: 'text-purple-500'
} as const;

export const LEVEL_BENEFITS = {
  BRONZE: ['Taxa de 4% + 4.99 por transação', 'Suporte por email'],
  SILVER: ['Taxa reduzida em 0.5%', 'Suporte prioritário'],
  GOLD: ['Taxa reduzida em 1%', 'Suporte 24/7', 'API com limite estendido'],
  PLATINUM: ['Taxa reduzida em 1.5%', 'Gerente de conta dedicado', 'Webhooks ilimitados'],
  CHALLENGER: ['Taxa reduzida em 2%', 'Suporte VIP', 'Recursos personalizados']
} as const;

export async function checkAndUpdateUserLevel(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      receivedTransactions: {
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }
    }
  });

  if (!user) return null;

  // Calcular faturamento mensal
  const monthlyRevenue = user.receivedTransactions.reduce(
    (total, tx) => total + tx.amount,
    0
  );

  // Determinar novo nível
  let newLevel = user.level;
  for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (monthlyRevenue >= threshold) {
      newLevel = level as UserLevel;
    }
  }

  // Se houve mudança de nível
  if (newLevel !== user.level) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        monthlyRevenue,
        lastLevelUpdate: new Date(),
        totalRevenue: {
          increment: monthlyRevenue
        },
        transactionCount: {
          increment: user.receivedTransactions.length
        }
      }
    });

    // Retornar informações para notificação
    return {
      previousLevel: user.level,
      newLevel,
      benefits: LEVEL_BENEFITS[newLevel],
      badge: LEVEL_BADGES[newLevel],
      color: LEVEL_COLORS[newLevel]
    };
  }

  // Atualizar métricas mesmo sem mudança de nível
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyRevenue,
      totalRevenue: {
        increment: monthlyRevenue
      },
      transactionCount: {
        increment: user.receivedTransactions.length
      }
    }
  });

  return null;
}