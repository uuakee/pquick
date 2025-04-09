import { useState, useEffect } from 'react';
import { UserLevel } from '@prisma/client';

interface User {
  id: number;
  name: string;
  email: string;
  level: UserLevel;
  role: "USER" | "ADMIN";
  totalRevenue: number;
  monthlyRevenue: number;
  transactionCount: number;
  lastLevelUpdate: Date;
  wallet: {
    balance: number;
    blocked_balance: number;
    available_balance: number;
  };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar dados do usuário");
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
} 