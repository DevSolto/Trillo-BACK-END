import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TaskService } from './task.service'
import { Task } from './entities/task.entity'

describe('TaskService', () => {
  let service: TaskService
  let repo: jest.Mocked<Repository<Task>>

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<Task>>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getRepositoryToken(Task), useValue: repoMock },
      ],
    }).compile()

    service = module.get<TaskService>(TaskService)
    repo = module.get(getRepositoryToken(Task))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('create persists task with relations', async () => {
    const dto: any = { title: 't', description: 'd', status: 'open', creatorId: 'u1', teamIds: ['u2','u3'] }
    const created = { ...dto } as any
    const saved = { id: 'task1', ...dto } as any
    repo.create.mockReturnValue(created)
    repo.save.mockResolvedValue(saved)

    const result = await service.create(dto)

    expect(repo.create).toHaveBeenCalledWith({
      title: 't',
      description: 'd',
      status: 'open',
      creator: { id: 'u1' },
      team: [{ id: 'u2' }, { id: 'u3' }],
    } as any)
    expect(repo.save).toHaveBeenCalledWith(created)
    expect(result).toBe(saved)
  })

  it('findAll returns paginated tasks with relations', async () => {
    const rows = [{ id: 't1' } as Task]
    repo.findAndCount!.mockResolvedValue([rows as any, 1] as any)
    const result = await service.findAll()
    expect(repo.findAndCount).toHaveBeenCalledWith({ relations: { creator: true, team: true }, where: {}, order: { id: 'ASC' }, skip: 0, take: 10 })
    expect(result).toEqual({ items: rows, total: 1, page: 1, limit: 10, pageCount: 1 })
  })

  it('findOne queries by id with relations', async () => {
    const row = { id: 't1' } as Task
    repo.findOne.mockResolvedValue(row as any)
    const result = await service.findOne('t1')
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 't1' }, relations: { creator: true, team: true } })
    expect(result).toBe(row)
  })

  it('update loads, mutates and saves task', async () => {
    const existing: any = { id: 't1', title: 'old', description: 'desc', status: 'open', creator: { id: 'u1' }, team: [{ id: 'u2' }] }
    repo.findOne.mockResolvedValue(existing)
    const saved = { ...existing, title: 'new', creator: { id: 'u9' }, team: [{ id: 'u7' }, { id: 'u8' }] }
    repo.save.mockResolvedValue(saved as any)

    const dto: any = { title: 'new', creatorId: 'u9', teamIds: ['u7','u8'] }
    const result = await service.update('t1', dto)

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 't1' }, relations: { team: true, creator: true } })
    expect(repo.save).toHaveBeenCalledWith(existing)
    expect(existing.title).toBe('new')
    expect(existing.creator).toEqual({ id: 'u9' })
    expect(existing.team).toEqual([{ id: 'u7' }, { id: 'u8' }])
    expect(result).toBe(saved)
  })

  it('remove calls repository delete', async () => {
    const del = { affected: 1 } as any
    repo.delete.mockResolvedValue(del)
    const result = await service.remove('t9')
    expect(repo.delete).toHaveBeenCalledWith({ id: 't9' })
    expect(result).toBe(del)
  })
})
