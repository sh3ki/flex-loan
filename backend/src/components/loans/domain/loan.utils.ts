export interface ComputedLoanFields {
  dailyInterest: number;
  totalInterest: number;
  totalPayable: number;
  dueDate: Date;
}

export function computeLoanFields(
  principal: number,
  interestPerDay: number,
  termDays: number,
  releaseDate: Date
): ComputedLoanFields {
  const dailyInterest = (principal * interestPerDay) / 100;
  const totalInterest = dailyInterest * termDays;
  const totalPayable = principal + totalInterest;
  const dueDate = new Date(releaseDate);
  dueDate.setDate(dueDate.getDate() + termDays);

  return {
    dailyInterest: Math.round(dailyInterest * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100,
    dueDate,
  };
}

export function generateLoanNumber(sequence: number): string {
  return `LOAN-${sequence.toString().padStart(3, '0')}`;
}

export function calculateLoanStatus(
  remainingBalance: number,
  dueDate: Date,
  paidAmount: number
): string {
  if (remainingBalance === 0) {
    return 'Paid';
  }

  if (remainingBalance > 0 && new Date() > dueDate) {
    return 'Overdue';
  }

  return 'Active';
}
