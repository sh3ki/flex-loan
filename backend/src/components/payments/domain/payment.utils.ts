export function generatePaymentNumber(loanNumber: string, paymentSequence: number): string {
  // Extract the numeric part from loan number (e.g., "Loan-001" -> "001")
    // Extract the numeric part from loan number (e.g., "LOAN-001" -> "001").
    // Supports legacy casing variants.
    const loanMatch = loanNumber.match(/^loan-(\d+)$/i);
  const loanSeq = loanMatch ? loanMatch[1] : '000';
  const paySeq = paymentSequence.toString().padStart(3, '0');
  return `PAY-${loanSeq}-${paySeq}`;
}
