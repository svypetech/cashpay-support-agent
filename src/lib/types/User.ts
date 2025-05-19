export interface User {
  _id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
  date: string;
  userStatus: string;
  verificationStatus: string;
  KycProfileAdded: boolean;
  KycIdDocAdded: boolean;
  KycSellfieAdded: boolean;
  DOB: string;
  region: string;
  idDocUrl: string;
  selfieUrl: string;
  suspendDate: string;
  updateDate: string;
  lastLoginDate: string;
  totalLogin: number;
  averageTime: number;
  loginFrequency: number;
  sessionDuration: number;
  totalTime: number;
  lastActivity: string
}
export interface Admin {
  canAccessApiLogs: boolean;
  canAccessSystemSettings: boolean;
  canApproveKyc: boolean;
  canResolveDispute: boolean;
  canViewTransactions: boolean;
  createdBy: string;
  date: string; // ISO date string
  description: string;
  email: string;
  name?: string;
  password: string;
  id: number;
  isBan: boolean;
  isDeleted: boolean;
  isSuspend: boolean;
  role: string;
  title: string;
  __v: number;
  _id: string;
  userStatus?: string;
  image?: string;
  imagePath?: string;
}