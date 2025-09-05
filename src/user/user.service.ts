import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { QueryUserDto } from './dto/query-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async create(userId: string, email: string, createUserDto: CreateUserDto) {
    try {
      const user = this.repo.create({
        id: userId,
        email,
        name: createUserDto.name,
        role: createUserDto.role,
      })
      const saved = await this.repo.save(user)
      return saved
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('E-mail já em uso')
      }
      throw err
    }
  }

  async findAll(query: QueryUserDto = { page: 1, limit: 10 }) {
    const { page = 1, limit = 10, name, email, role, sortBy = 'id', sortOrder = 'ASC' } = query ?? {}
    const take = Math.max(1, Math.min(limit ?? 10, 100))
    const skip = Math.max(0, ((page ?? 1) - 1) * take)

    const where: any = {}
    if (name) where.name = Like(`%${name}%`)
    if (email) where.email = Like(`%${email}%`)
    if (typeof role !== 'undefined') where.role = role

    const [items, total] = await this.repo.findAndCount({ skip, take, where, order: { [sortBy]: (String(sortOrder).toUpperCase() as 'ASC' | 'DESC') ?? 'ASC' } })
    const pageCount = Math.ceil(total / take) || 1

    return { items, total, page: page ?? 1, limit: take, pageCount }
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  async findOneByEmail(email: string) {
    const user = await this.repo.findOne({ where: { email } })
    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const payload: any = { ...updateUserDto }
      return await this.repo.update(
        {
          id,
        },
        payload,
      )
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('E-mail já em uso')
      }
      throw err
    }
  }

  remove(id: string) {
    return this.repo.delete({
      id
    })
  }
}
