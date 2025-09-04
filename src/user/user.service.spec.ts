import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserService } from './user.service'
import { User } from './entities/user.entity'

describe('UserService', () => {
  let service: UserService
  let repo: jest.Mocked<Repository<User>>

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<User>>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repoMock },
      ],
    }).compile()

    service = module.get<UserService>(UserService)
    repo = module.get(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should persist and return the user', async () => {
      const dto = { name: 'Alice', email: 'a@a.com', password: 'Secret123!', role: 'editor' } as any
      const savedEntity = { id: 'u1', name: dto.name, email: dto.email, role: dto.role } as any
      repo.create.mockImplementation((arg: any) => arg)
      repo.save.mockResolvedValue({ ...savedEntity, password: 'hashed' } as any)

      const result = await service.create(dto)

      // password deve ser hasheada antes do save
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          email: dto.email,
          role: dto.role,
          password: expect.any(String),
        }),
      )
      const createdArgs = repo.create.mock.calls[0][0]
      expect(createdArgs.password).not.toBe(dto.password)

      expect(repo.save).toHaveBeenCalled()
      // retorno não deve conter password
      expect(result).toEqual(savedEntity)
    })
  })

  describe('findAll', () => {
    it('returns paginated users', async () => {
      const users = [{ id: '1' } as User]
      repo.findAndCount!.mockResolvedValue([users as any, 1] as any)

      const result = await service.findAll()
      expect(repo.findAndCount).toHaveBeenCalledWith({ where: {}, order: { id: 'ASC' }, skip: 0, take: 10 })
      expect(result).toEqual({ items: users, total: 1, page: 1, limit: 10, pageCount: 1 })
    })
  })

  describe('findOne', () => {
    it('should query by id and return entity', async () => {
      const user = { id: 'u1' } as User
      // @ts-ignore
      repo.findOne = jest.fn().mockResolvedValue(user)

      const result = await service.findOne('u1')

      // @ts-ignore
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } })
      expect(result).toBe(user)
    })
  })

  describe('findOneByEmail', () => {
    it('should query by email and return entity', async () => {
      const user = { id: 'u1', email: 'a@a.com' } as User
      // @ts-ignore
      repo.findOne = jest.fn().mockResolvedValue(user)

      const result = await service.findOneByEmail('a@a.com')

      // @ts-ignore
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@a.com' } })
      expect(result).toBe(user)
    })
  })

  describe('update', () => {
    it('should call repository update', async () => {
      const payload = { name: 'Bob' }
      const updateResult = { affected: 1, generatedMaps: [], raw: [] } as any
      repo.update.mockResolvedValue(updateResult)

      const result = await service.update('u1', payload as any)

      expect(repo.update).toHaveBeenCalledWith({ id: 'u1' }, payload)
      expect(result).toBe(updateResult)
    })
  })

  describe('remove', () => {
    it('should call repository delete', async () => {
      const deleteResult = { affected: 1, raw: [] } as any
      repo.delete.mockResolvedValue(deleteResult)

      const result = await service.remove('u1')

      expect(repo.delete).toHaveBeenCalledWith({ id: 'u1' })
      expect(result).toBe(deleteResult)
    })
  })
})
