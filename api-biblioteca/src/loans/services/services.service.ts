import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Loan } from '../entities/entities';
import { LoanFactory, CreateLoanDTO , LoanHistoryDTO} from '../factory/factory';


@Injectable()
export class LoansService {
  private loanFactory: LoanFactory;

  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,
  ) {
    this.loanFactory = new LoanFactory();
  }

  async createLoan(createLoanDto: CreateLoanDTO): Promise<Loan> {
    const loan = this.loanFactory.createLoan(createLoanDto);
    return await this.loansRepository.save(loan);
  }

  async getLoanById(id: string): Promise<Loan> {
    const loan = await this.loansRepository.findOne({ where: { id } });
    if (!loan) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }
    return loan;
  }

  async returnLoan(id: string): Promise<Loan> {
    const loan = await this.getLoanById(id);
    loan.returnDate = new Date();
    return await this.loansRepository.save(loan);
  }
  async getUserLoansHistory(userId: string): Promise<LoanHistoryDTO[]> {
    const loans = await this.loansRepository.find({
      where: { userId },
      order: { loanDate: 'DESC' }
    });

    if (!loans || loans.length === 0) {
      throw new NotFoundException(`No se encontraron préstamos para el usuario ${userId}`);
    }

    // Transformar los préstamos usando el factory
    return loans.map(loan => this.loanFactory.createLoanHistory(loan));
  }
}
