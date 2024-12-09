import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoansService } from './services/services.service';
import { LoansSoapController } from './controllers/controllers.controller';
import { Loan } from './entities/entities';
import { LoansRestController } from './controllers/rest.controller';
import { AuthModule } from '../auth/auth.module';
import {LoansSoapProxyController} from './controllers/loans-proxy.controller';
 
@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    AuthModule,
  ],
  controllers: [
    LoansSoapController,
    LoansRestController,
    LoansSoapProxyController
  ],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
