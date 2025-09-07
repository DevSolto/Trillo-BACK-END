import { Test, TestingModule } from '@nestjs/testing'
import { MetaController } from './meta.controller'

describe('MetaController', () => {
  let controller: MetaController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetaController],
    }).compile()

    controller = module.get<MetaController>(MetaController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('getUserRoles retorna os valores esperados', () => {
    expect(controller.getUserRoles()).toEqual(['admin', 'editor'])
  })

  it('getTaskStatus retorna os valores esperados', () => {
    expect(controller.getTaskStatus()).toEqual([
      'open',
      'inProgress',
      'finished',
      'canceled',
    ])
  })

  it('getAllEnums retorna objeto com todos os arrays', () => {
    expect(controller.getAllEnums()).toEqual({
      userRoles: ['admin', 'editor'],
      taskStatus: ['open', 'inProgress', 'finished', 'canceled'],
      taskTypes: ['general', 'bug', 'feature', 'improvement', 'meeting'],
    })
  })
})
