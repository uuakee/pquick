import { compare, hash } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { z } from 'zod';
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Schemas de validação
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  segment: z.enum(['ECOMMERCE', 'MARKETPLACE', 'SAAS', 'MARKETING', 'FINANCE', 'EDUCATION', 'HEALTH', 'ENTERTAINMENT', 'IGAMING', 'OTHER']),
  phone: z.string().min(10, 'Telefone inválido'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  address: z.string().min(5, 'Endereço inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zip: z.string().min(8, 'CEP inválido'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email ou username é obrigatório'),
  password: z.string().min(6, 'Senha inválida'),
});

// Funções de autenticação
export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export function generateToken(userId: number, email: string, username: string) {
  return sign({ userId, email, username }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded as { userId: number };
  } catch (error) {
    return null;
  }
}

// Middleware de autenticação
export async function authenticateRequest(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
  } catch (error) {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // Aqui você deve implementar a verificação da senha
        // Por enquanto, vamos apenas retornar o usuário
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
}; 