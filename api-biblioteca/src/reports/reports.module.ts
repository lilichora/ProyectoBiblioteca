import { Module } from '@nestjs/common';
import { ReportsSoapController } from './controllers/controllers.controller';
import { ReportsService } from './services/services.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '../loans/entities/entities';
import { User } from '../users/entities/user.entities';
import { Book } from '../books/entities/entities';
import { AuthModule } from '../auth/auth.module';
import {ReportsSoapProxyController} from './controllers/reports-proxy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, User, Book]),
    AuthModule,
  ],
  controllers: [ReportsSoapController,ReportsSoapProxyController],
  providers: [ReportsService]
})
export class ReportsModule {}