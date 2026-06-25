export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

export interface Creditor {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  principal: number;
  interestPerDay: number;
  termDays: number;
  releaseDate: string;
  dueDate: string;
  dailyInterest: number;
  totalInterest: number;
  totalPayable: number;
  paidAmount: number;
  remainingBalance: number;
  status: string;
  creditorId: string;
  creditor?: Creditor;
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  loanId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  module: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface SystemSettings {
  businessName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  loanMinimum: number;
  loanMaximum: number;
  dailyInterestRate: number;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  updatedAt?: string;
}
