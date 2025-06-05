// User Types
export interface User {
  _id: string;
  lineUserId: string;
  displayName: string;
  credits: number;
  interactionCount: number;
  lastInteraction: Date;
  firstInteraction: Date;
  creditsUsed?: number;
  creditsReceived?: number;
}

// Admin Types
export interface Admin {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: Date;
}

// Command Types
export interface Command {
  _id: string;
  text: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Transaction Types
export interface CreditTransaction {
  _id: string;
  user: User | string;
  amount: number;
  type: 'use' | 'admin_add' | 'payment' | 'gift';
  reason: string;
  addedByAdmin?: Admin | string;
  createdAt: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalInteractions: number;
  dailyUsers: Array<{ date: string; count: number }>;
  newUsers: Array<{ date: string; count: number }>;
  avgProcessingTime: number;
  creditStats: {
    totalCredits: number;
    creditsUsedToday: number;
    usersWithNoCredits: number;
    usersWithLowCredits: number;
    dailyCreditUsage: Array<{ date: string; count: number }>;
  };
}

// Pagination Types
export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
} 