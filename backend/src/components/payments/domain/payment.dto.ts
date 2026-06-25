export interface CreatePaymentDto {
  loanId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentResponseDto {
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

export interface PaymentListDto {
  data: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
}
