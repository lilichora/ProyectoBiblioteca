export interface ActiveLoansReportDTO {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    bookCategory?: string;
  }
  
  export interface UserHistoryReportDTO {
    userId: string;
    format: 'PDF' | 'EXCEL';
  }
  
  export interface LoanReportItemDTO {
    loanId: string;
    userName: string;
    bookTitle: string;
    loanDate: Date;
    returnDate?: Date;
    status: string;
  }
  
  export interface UserHistoryItemDTO {
    loanId: string;
    bookTitle: string;
    loanDate: Date;
    returnDate?: Date;
    status: string;
    penalty?: number;
  }