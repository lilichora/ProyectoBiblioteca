import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entities';
import { BooksModule } from './books/books.module';
import { Book } from './books/entities/entities';
import { LoansModule } from './loans/loans.module';
import { Loan } from './loans/entities/entities';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'biblioteca_db',
      entities: [User, Book, Loan],
      synchronize: true,
    }),
    UsersModule,
    BooksModule,
    LoansModule,
    AuthModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
