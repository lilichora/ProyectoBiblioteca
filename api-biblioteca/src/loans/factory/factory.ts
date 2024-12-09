import { Loan } from '../entities/entities';

export interface ILoanFactory {
  createLoan(data: CreateLoanDTO): Loan;
}

export class LoanFactory implements ILoanFactory {
  createLoan(data: CreateLoanDTO): Loan {
    const loan = new Loan();
    loan.bookId = data.bookId;
    loan.userId = data.userId;
    loan.loanDate = new Date();
    return loan;
  }
  createLoanHistory(loan: Loan): LoanHistoryDTO {
    return {
      id: loan.id,
      bookId: loan.bookId,
      loanDate: loan.loanDate,
      estado: loan.returnDate ? 'Devuelto' : 'Prestado',
      returnDate: loan.returnDate,
    };
  }
}

export interface CreateLoanDTO {
  bookId: string;
  userId: string;
}
export interface LoanHistoryDTO {
  id: string;
  bookId: string;
  loanDate: Date;
  estado: string;  // 'Prestado' o 'Devuelto'
  returnDate?: Date;
}
