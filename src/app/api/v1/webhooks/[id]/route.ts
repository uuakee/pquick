import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const id = context.params.id;
    if (!id) {
      return NextResponse.json(
        { error: "ID do webhook não fornecido" },
        { status: 400 }
      );
    }

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
