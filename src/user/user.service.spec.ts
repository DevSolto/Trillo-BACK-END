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
      const entity = { id: 'u1', ...dto }
      repo.create.mockReturnValue(dto as any)
      repo.save.mockResolvedValue(entity as any)

      const result = await service.create(dto)

      expect(repo.create).toHaveBeenCalledWith(dto)
      expect(repo.save).toHaveBeenCalledWith(dto)
      expect(result).toEqual(entity)
    })
  })

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: '1' } as User]
      repo.find.mockResolvedValue(users as any)

      await expect(service.findAll()).resolves.toEqual(users)
      expect(repo.find).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should query by id', async () => {
      const user = { id: 'u1' } as User
      repo.findOneBy.mockResolvedValue(user as any)

      const result = await service.findOne('u1')

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'u1' })
      expect(result).toBe(user)
    })
  })

  describe('findOneByEmail', () => {
    it('should query by email', async () => {
      const user = { id: 'u1', email: 'a@a.com' } as User
      repo.findOneBy.mockResolvedValue(user as any)

      const result = await service.findOneByEmail('a@a.com')

      expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'a@a.com' })
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
