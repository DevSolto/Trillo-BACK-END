import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { MetaModule } from '../src/meta/meta.module'

describe('Meta (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MetaModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /meta/enums/user-roles', async () => {
    const server = app.getHttpServer()
    const res = await request(server).get('/meta/enums/user-roles').expect(200)
    expect(res.body).toEqual(['admin', 'editor'])
  })

  it('GET /meta/enums/task-status', async () => {
    const server = app.getHttpServer()
    const res = await request(server).get('/meta/enums/task-status').expect(200)
    expect(res.body).toEqual(['open', 'inProgress', 'finished', 'canceled'])
  })

  it('GET /meta/enums (agregado)', async () => {
    const server = app.getHttpServer()
    const res = await request(server).get('/meta/enums').expect(200)
    expect(res.body).toEqual({
      userRoles: ['admin', 'editor'],
      taskStatus: ['open', 'inProgress', 'finished', 'canceled'],
    })
  })
})

