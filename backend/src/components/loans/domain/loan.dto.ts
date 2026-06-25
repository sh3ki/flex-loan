export interface CreateLoanDto {
  creditorId: string;
  principal: number;
  interestPerDay: number;
  termDays: number;
  releaseDate: string;
}

export interface UpdateLoanDto {
  principal?: number;
  interestPerDay?: number;
  termDays?: number;
  releaseDate?: string;
}

export interface LoanResponseDto {
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
  createdAt: string;
}

export interface LoanListDto {
  data: LoanResponseDto[];
  total: number;
  page: number;
  limit: number;
}
