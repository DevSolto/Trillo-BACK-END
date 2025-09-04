import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, status, creatorId, teamIds } = createTaskDto

    const task = this.repo.create({
      title,
      description,
      status,
      creator: { id: creatorId } as User,
      team: (teamIds ?? []).map((id) => ({ id } as User)),
    })

    return await this.repo.save(task)
  }

  async findAll(query: QueryTaskDto = { page: 1, limit: 10 }) {
    const { page = 1, limit = 10, title, status, creatorId, sortBy = 'id', sortOrder = 'ASC' } = query ?? {}
    const take = Math.max(1, Math.min(limit ?? 10, 100))
    const skip = Math.max(0, ((page ?? 1) - 1) * take)

    const where: any = {}
    if (title) where.title = Like(`%${title}%`)
    if (typeof status !== 'undefined') where.status = status
    if (typeof creatorId !== 'undefined') where.creator = { id: creatorId } as User

    const [items, total] = await this.repo.findAndCount({
      relations: { creator: true, team: true },
      where,
      order: { [sortBy]: (String(sortOrder).toUpperCase() as 'ASC' | 'DESC') ?? 'ASC' },
      skip,
      take,
    })
    const pageCount = Math.ceil(total / take) || 1

    return { items, total, page: page ?? 1, limit: take, pageCount }
  }

  async findOne(id: string) {
    const task = await this.repo.findOne({ where: { id }, relations: { creator: true, team: true } })
    if (!task) throw new NotFoundException('Task not found')
    return task
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.repo.findOne({ where: { id }, relations: { team: true, creator: true } })
    if (!task) throw new NotFoundException('Task not found')

    if (typeof updateTaskDto.title !== 'undefined') task.title = updateTaskDto.title
    if (typeof updateTaskDto.description !== 'undefined') task.description = updateTaskDto.description
    if (typeof updateTaskDto.status !== 'undefined') task.status = updateTaskDto.status
    if (typeof updateTaskDto.creatorId !== 'undefined') task.creator = { id: updateTaskDto.creatorId } as User
    if (typeof updateTaskDto.teamIds !== 'undefined') task.team = (updateTaskDto.teamIds ?? []).map((id) => ({ id } as User))

    return await this.repo.save(task)
  }

  remove(id: string) {
    return this.repo.delete({ id })
  }
}
