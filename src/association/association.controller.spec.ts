import { Test, TestingModule } from '@nestjs/testing'
import { AssociationController } from './association.controller'
import { AssociationService } from './association.service'

describe('AssociationController', () => {
  let controller: AssociationController

  beforeEach(async () => {
    const serviceMock: Partial<AssociationService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOneById: jest.fn(),
      findOneByCnpj: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationController],
      providers: [{ provide: AssociationService, useValue: serviceMock }],
    }).compile()

    controller = module.get<AssociationController>(AssociationController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
