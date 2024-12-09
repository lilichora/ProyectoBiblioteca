import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/services.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, userType: user.userType };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
      }
    };
  }

  // Método para validar tokens SOAP
  async validateSoapToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token);
      const user = await this.usersService.findByEmail(decoded.email);
      if (!user || user.suspended) {
        throw new UnauthorizedException();
      }
      return {
        id: user.id,
        email: user.email,
        userType: user.userType,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
