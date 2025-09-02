import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { UserService } from './user.service'

describe('UserController', () => {
  let controller: UserController
  let service: jest.Mocked<UserService>

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<UserService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: serviceMock }],
    }).compile()

    controller = module.get<UserController>(UserController)
    service = module.get(UserService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('create should delegate to service', async () => {
    const dto: any = { name: 'A', email: 'a@a.com', password: 'Secret123!' }
    const user = { id: '1', ...dto }
    service.create.mockResolvedValue(user as any)

    const result = await controller.create(dto)

    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(user)
  })

  it('findAll should delegate to service', async () => {
    const users = [{ id: '1' }]
    service.findAll.mockResolvedValue(users as any)

    await expect(controller.findAll()).resolves.toEqual(users)
    expect(service.findAll).toHaveBeenCalled()
  })

  it('findOneById should delegate to service', async () => {
    const user = { id: '1' }
    service.findOne.mockResolvedValue(user as any)

    const result = await controller.findOneById('1')

    expect(service.findOne).toHaveBeenCalledWith('1')
    expect(result).toBe(user)
  })

  it('findOneByEmail should delegate to service', async () => {
    const user = { id: '1', email: 'a@a.com' }
    service.findOneByEmail.mockResolvedValue(user as any)

    const result = await controller.findOneByEmail('a@a.com')

    expect(service.findOneByEmail).toHaveBeenCalledWith('a@a.com')
    expect(result).toBe(user)
  })

  it('update should delegate to service', async () => {
    const dto: any = { name: 'B' }
    const updateResult = { affected: 1 }
    service.update.mockResolvedValue(updateResult as any)

    const result = await controller.update('1', dto)

    expect(service.update).toHaveBeenCalledWith('1', dto)
    expect(result).toBe(updateResult)
  })

  it('remove should delegate to service', async () => {
    const deleteResult = { affected: 1 }
    service.remove.mockResolvedValue(deleteResult as any)

    const result = await controller.remove('1')

    expect(service.remove).toHaveBeenCalledWith('1')
    expect(result).toBe(deleteResult)
  })
})
