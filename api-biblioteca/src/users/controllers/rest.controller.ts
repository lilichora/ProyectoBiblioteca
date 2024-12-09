// src/users/controllers/users.rest.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/services.service';
import { UpdateUserDto } from '../factory/user.factory';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsersRestController {
  constructor(private readonly usersService: UsersService) {}

  // Listar todos los usuarios
  @Get()
  async getAllUsers() {
    return await this.usersService.getAllUsers();
  }

  // Actualizar usuario
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(id, updateUserDto);
  }
}
