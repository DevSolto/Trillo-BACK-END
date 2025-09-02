import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AssociationService } from './association.service'
import { Association } from './entities/association.entity'

describe('AssociationService', () => {
  let service: AssociationService;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<Association>>> = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociationService,
        { provide: getRepositoryToken(Association), useValue: repoMock },
      ],
    }).compile()

    service = module.get<AssociationService>(AssociationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
