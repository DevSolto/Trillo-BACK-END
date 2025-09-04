import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto
      const hashed = await bcrypt.hash(password, 10)
      const user = this.repo.create({ ...rest, password: hashed })
      const saved = await this.repo.save(user)
      // Evita vazar senha no retorno
      // @ts-expect-error
      delete (saved as any).password
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
      if (typeof updateUserDto.password !== 'undefined') {
        payload.password = await bcrypt.hash(updateUserDto.password, 10)
      }
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
