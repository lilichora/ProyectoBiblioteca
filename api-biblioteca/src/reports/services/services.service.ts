// src/reports/services/services.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Loan } from '../../loans/entities/entities';
import { User } from '../../users/entities/user.entities';
import { Book } from '../../books/entities/entities';
import * as ExcelJS from 'exceljs';
import * as PDFKit from 'pdfkit';
import { WritableStreamBuffer } from 'stream-buffers';
import { ActiveLoansReportDTO, UserHistoryReportDTO, LoanReportItemDTO, UserHistoryItemDTO } from '../dtos/dtos';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Loan)
    private loansRepository: Repository<Loan>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  async generateActiveLoansReport(filters: ActiveLoansReportDTO): Promise<LoanReportItemDTO[]> {
    let query = this.loansRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.user', 'user')
      .leftJoinAndSelect('loan.book', 'book')
      .where('loan.returnDate IS NULL');

    if (filters.startDate && filters.endDate) {
      query = query.andWhere('loan.loanDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.userId) {
      query = query.andWhere('user.id = :userId', { userId: filters.userId });
    }

    if (filters.bookCategory) {
      query = query.andWhere('book.category = :category', { 
        category: filters.bookCategory 
      });
    }

    const loans = await query.getMany();

    return loans.map(loan => ({
      loanId: loan.id,
      userName: loan.user.name,
      bookTitle: loan.book.title,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      status: loan.returnDate ? 'Devuelto' : 'Prestado'
    }));
  }

  async generateUserHistory(params: UserHistoryReportDTO): Promise<Buffer> {
    const loans = await this.loansRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.book', 'book')
      .where('loan.userId = :userId', { userId: params.userId })
      .orderBy('loan.loanDate', 'DESC')
      .getMany();

    const data = loans.map(loan => ({
      loanId: loan.id,
      bookTitle: loan.book.title,
      loanDate: loan.loanDate,
      returnDate: loan.returnDate,
      status: loan.returnDate ? 'Devuelto' : 'Prestado',
      penalty: 0 // Implementar lógica de multas si es necesario
    }));

    return params.format === 'PDF' 
      ? await this.generatePDF(data)
      : await this.generateExcel(data);
  }

// src/reports/services/services.service.ts
private async generateExcel(data: UserHistoryItemDTO[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Préstamos');
  
    worksheet.columns = [
      { header: 'ID Préstamo', key: 'loanId' },
      { header: 'Libro', key: 'bookTitle' },
      { header: 'Fecha Préstamo', key: 'loanDate' },
      { header: 'Fecha Devolución', key: 'returnDate' },
      { header: 'Estado', key: 'status' },
      { header: 'Multa', key: 'penalty' }
    ];
  
    worksheet.addRows(data);
  
    const buffer = await workbook.xlsx.writeBuffer() as Buffer;
    return buffer;
  }





  async generateActiveLoansExcel(data: LoanReportItemDTO[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Préstamos Activos');
  
    worksheet.columns = [
      { header: 'ID Préstamo', key: 'loanId' },
      { header: 'Usuario', key: 'userName' },
      { header: 'Libro', key: 'bookTitle' },
      { header: 'Fecha Préstamo', key: 'loanDate' },
      { header: 'Estado', key: 'status' }
    ];
  
    worksheet.addRows(data);
  
    return await workbook.xlsx.writeBuffer() as Buffer;
  }
  
  async generateActiveLoansPDF(data: LoanReportItemDTO[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit();
      const writeStream = new WritableStreamBuffer();
  
      doc.pipe(writeStream);
      doc.fontSize(16).text('Reporte de Préstamos Activos', { align: 'center' });
      doc.moveDown();
  
      data.forEach(item => {
        doc.fontSize(12).text(`Préstamo ID: ${item.loanId}`);
        doc.fontSize(10)
          .text(`Usuario: ${item.userName}`)
          .text(`Libro: ${item.bookTitle}`)
          .text(`Fecha de préstamo: ${item.loanDate}`)
          .text(`Estado: ${item.status}`);
        doc.moveDown();
      });
  
      doc.end();
  
      writeStream.on('finish', () => {
        const contents = writeStream.getContents();
        if (contents === false) {
          reject(new Error('Error al generar el PDF'));
        } else {
          resolve(contents);
        }
      });
    });
  }





  private async generatePDF(data: UserHistoryItemDTO[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFKit();
      const writeStream = new WritableStreamBuffer();

      doc.pipe(writeStream);
      doc.fontSize(16).text('Historial de Préstamos', { align: 'center' });
      doc.moveDown();

      data.forEach(item => {
        doc.fontSize(12).text(`Préstamo ID: ${item.loanId}`);
        doc.fontSize(10)
          .text(`Libro: ${item.bookTitle}`)
          .text(`Fecha de préstamo: ${item.loanDate}`)
          .text(`Fecha de devolución: ${item.returnDate || 'Pendiente'}`)
          .text(`Estado: ${item.status}`)
          .text(`Multa: $${item.penalty}`);
        doc.moveDown();
      });

      doc.end();

      writeStream.on('finish', () => {
        const contents = writeStream.getContents();
        if (contents === false) {
          reject(new Error('Error al generar el PDF'));
        } else {
          resolve(contents);
        }
      });
    });
  }
}
