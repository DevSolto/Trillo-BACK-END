import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto)
    return await this.repo.save(user)
  }

  findAll() {
    return this.repo.find()
  }

  findOne(id: string) {
    return this.repo.findOneBy({
      id
    })
  }

  findOneByEmail(email: string) {
    return this.repo.findOneBy({
      email
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.repo.update(
      {
        id
      },
      updateUserDto)
  }

  remove(id: string) {
    return this.repo.delete({
      id
    })
  }
}
