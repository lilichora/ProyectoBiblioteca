// src/loans/controllers/loans.rest.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LoansService } from '../services/services.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class LoansRestController {
  constructor(private readonly loansService: LoansService) {}

  @Get(':id/prestamos')
  async getUserLoans(@Param('id') userId: string) {
    return await this.loansService.getUserLoansHistory(userId);
  }
}
