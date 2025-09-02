import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';

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

  findAll() {
    return this.repo.find({ relations: { creator: true, team: true } })
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id }, relations: { creator: true, team: true } })
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
