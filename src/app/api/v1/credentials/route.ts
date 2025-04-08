import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Função para gerar client_id e client_secret
function generateCredentials() {
  const client_id = randomBytes(16).toString('hex');
  const client_secret = randomBytes(32).toString('hex');
  return { client_id, client_secret };
}

// Listar credenciais
export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Erro ao listar credenciais:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Criar nova credencial
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se já existe uma credencial ativa
    const activeKey = await prisma.apiKey.findFirst({
      where: {
        userId: auth.userId,
        status: 'ACTIVE',
      },
    });

    if (activeKey) {
      return NextResponse.json(
        { error: 'Você já possui uma credencial ativa' },
        { status: 400 }
      );
    }

    // Gerar novas credenciais
    const { client_id, client_secret } = generateCredentials();

    // Criar nova API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: auth.userId,
        client_id,
        client_secret,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error('Erro ao criar credencial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 