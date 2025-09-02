import { Test, TestingModule } from '@nestjs/testing'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

describe('TaskController', () => {
  let controller: TaskController
  let service: jest.Mocked<TaskService>

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<TaskService>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: serviceMock }],
    }).compile()

    controller = module.get<TaskController>(TaskController)
    service = module.get(TaskService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('create should delegate to service', async () => {
    service.create.mockReturnValue('ok' as any)
    const dto: any = {}
    const result = await controller.create(dto)
    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result).toBe('ok')
  })

  it('findAll should delegate to service', async () => {
    service.findAll.mockReturnValue(['x'] as any)
    const result = await controller.findAll()
    expect(service.findAll).toHaveBeenCalled()
    expect(result).toEqual(['x'])
  })

  it('findOne should pass id as string', async () => {
    service.findOne.mockReturnValue('value' as any)
    const result = await controller.findOne('uuid-5')
    expect(service.findOne).toHaveBeenCalledWith('uuid-5')
    expect(result).toBe('value')
  })

  it('update should pass id as string', async () => {
    service.update.mockReturnValue('updated' as any)
    const result = await controller.update('uuid-10', { a: 1 } as any)
    expect(service.update).toHaveBeenCalledWith('uuid-10', { a: 1 })
    expect(result).toBe('updated')
  })

  it('remove should pass id as string', async () => {
    service.remove.mockReturnValue('removed' as any)
    const result = await controller.remove('uuid-3')
    expect(service.remove).toHaveBeenCalledWith('uuid-3')
    expect(result).toBe('removed')
  })
})
