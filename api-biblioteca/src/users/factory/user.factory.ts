import { User } from '../entities/user.entities';

// Opcional: Crear un enum para los tipos de usuario
export enum UserType {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export interface IUserFactory {
  createUser(): User;
}

export class StudentFactory implements IUserFactory {
  createUser(): User {
    const user = new User();
    user.userType = UserType.STUDENT;
    return user;
  }
}

export class TeacherFactory implements IUserFactory {
  createUser(): User {
    const user = new User();
    user.userType = UserType.TEACHER;
    return user;
  }
}

export class AdminFactory implements IUserFactory {
  createUser(): User {
    const user = new User();
    user.userType = UserType.ADMIN;
    return user;
  }
}

export class UserFactoryCreator {
  static createFactory(type: string): IUserFactory {
    switch (type.toLowerCase()) {
      case UserType.STUDENT:
        return new StudentFactory();
      case UserType.TEACHER:
        return new TeacherFactory();
      case UserType.ADMIN:
        return new AdminFactory();
      default:
        throw new Error('Invalid user type');
    }
  }
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  userType?: UserType;
  password?: string;
}
