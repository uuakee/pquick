import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(webhooks);
  } catch (error) {
    console.error("Erro ao buscar webhooks:", error);
    return NextResponse.json(
      { error: "Erro ao buscar webhooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { url, type } = await request.json();

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 });
    }

    // Verificar se já existe webhook do mesmo tipo
    const existingWebhook = await prisma.webhook.findFirst({
      where: {
        userId: payload.userId,
        type,
      },
    });

    if (existingWebhook) {
      return NextResponse.json(
        { error: "Já existe um webhook deste tipo" },
        { status: 400 }
      );
    }

    // Criar webhook com userId do payload
    const webhook = await prisma.webhook.create({
      data: {
        url,
        type,
        user: {
          connect: {
            id: payload.userId
          }
        }
      },
    });

    return NextResponse.json(webhook);
  } catch (error) {
    console.error("Erro ao criar webhook:", error);
    return NextResponse.json(
      { error: "Erro ao criar webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "ID do webhook não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se o webhook pertence ao usuário
    const webhook = await prisma.webhook.findFirst({
      where: {
        id: parseInt(id),
        userId: payload.userId,
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook não encontrado" },
        { status: 404 }
      );
    }

    await prisma.webhook.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir webhook:", error);
    return NextResponse.json(
      { error: "Erro ao excluir webhook" },
      { status: 500 }
    );
  }
}
