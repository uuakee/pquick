export interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  role: 'USER' | 'ADMIN';
  wallet: {
    id: number;
    balance: number;
    available_balance: number;
  };
} 