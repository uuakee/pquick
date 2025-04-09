import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync } from "fs";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token não fornecido" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const platform = await prisma.plataform.findFirst();

  if (!platform) {
    // Criar uma configuração padrão se não existir
    const defaultPlatform = await prisma.plataform.create({
      data: {
        name: "PayQuick",
        url: "https://payquick.com.br",
        color: "#0066FF",
        logo_url: "",
      },
    });
    return NextResponse.json(defaultPlatform);
  }

  return NextResponse.json(platform);
}

export async function PUT(request: Request) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Token não fornecido" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const color = formData.get("color") as string;
  const description = formData.get("description") as string;
  const logo = formData.get("logo") as File;

  if (!name || !url || !color || !description) {
    return NextResponse.json(
      { error: "Campos obrigatórios não fornecidos" },
      { status: 400 }
    );
  }

  let logo_url = undefined;

  if (logo) {
    try {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = join(process.cwd(), "public/uploads");
      
      // Criar diretório se não existir
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const uniqueFilename = `${uuidv4()}-${logo.name}`;
      const path = join(uploadDir, uniqueFilename);

      await writeFile(path, buffer);
      logo_url = `/uploads/${uniqueFilename}`;
    } catch (error) {
      console.error("Erro ao salvar o arquivo:", error);
      return NextResponse.json(
        { error: "Erro ao processar o upload do logo" },
        { status: 500 }
      );
    }
  }

  const platform = await prisma.plataform.upsert({
    where: { id: 1 },
    update: {
      name,
      url,
      color,
      description,
      ...(logo_url && { logo_url }),
    },
    create: {
      name,
      url,
      color,
      description,
      logo_url: logo_url || "",
    },
  });

  return NextResponse.json(platform);
} 