import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(params: {
    email: string;
    password: string; // already hashed
    role?: UserRole;
    name?: string;
  }) {
    const user = this.usersRepo.create({
      email: params.email.toLowerCase(),
      password: params.password,
      role: params.role ?? 'user',
      name: params.name,
    });

    return this.usersRepo.save(user);
  }
}
