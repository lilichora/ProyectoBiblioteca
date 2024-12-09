import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entities';
import { UsersService } from './services/services.service';
import { UsersSoapController } from './controllers/controllers.controller';
import { UsersRestController } from './controllers/rest.controller';
import { AuthModule } from '../auth/auth.module';
import { SoapProxyController } from './controllers/soap-proxy.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule)
  ],
  controllers: [UsersSoapController, UsersRestController, SoapProxyController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
