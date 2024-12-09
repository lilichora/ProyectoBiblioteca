import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entities';
import { UserFactoryCreator } from '../factory/user.factory';
import { UpdateUserDto } from '../factory/user.factory';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }


   // Método nuevo para listar todos los usuarios
   async getAllUsers(): Promise<User[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'userType'] // Solo seleccionamos los campos necesarios
    });
    
    if (!users || users.length === 0) {
      throw new NotFoundException('No se encontraron usuarios');
    }
    
    return users;
  }

  // Método nuevo para actualizar usuario
  // Método nuevo para actualizar usuario
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Si se está actualizando el tipo de usuario, usar el factory
    if (updateUserDto.userType) {
      const factory = UserFactoryCreator.createFactory(updateUserDto.userType);
      const newUser = factory.createUser();
      user.userType = newUser.userType;
    }

    // Actualizar otros campos
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) {
      // Verificar si el nuevo email ya existe
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: updateUserDto.email }
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El email ya está en uso');
      }
      user.email = updateUserDto.email;
    }

    // Encriptar la contraseña si se está actualizando
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async registerUser(name: string, email: string, userType: string, password: string): Promise<User> {
    try {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const factory = UserFactoryCreator.createFactory(userType);
      const user = factory.createUser();
      user.name = name;
      user.email = email;
      user.password = hashedPassword;

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error registering user: ' + error.message);
    }
  }

  async suspendUser(userId: string, reason: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.suspended = true;
    user.suspensionReason = reason;
    user.updatedAt = new Date();

    return await this.usersRepository.save(user);
  }
}