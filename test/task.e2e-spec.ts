import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import request from 'supertest'
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter'
import { TaskModule } from '../src/task/task.module'
import { Task } from '../src/task/entities/task.entity'
import { UserModule } from '../src/user/user.module'
import { User } from '../src/user/entities/user.entity'

jest.setTimeout(30000)

describe('Task (e2e) - CRUD com relações', () => {
  let app: INestApplication

  const genEmail = () => `user_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5433', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASS || 'postgres',
          database: process.env.DB_NAME || 'nest_db',
          entities: [User, Task],
          synchronize: true,
          dropSchema: true,
        }),
        UserModule,
        TaskModule,
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    // Injeta req.user para compatibilizar com o novo fluxo (sem JWT no teste)
    app.use((req: any, _res: any, next: any) => {
      if (req.method === 'POST' && req.path.startsWith('/user')) {
        req.user = { userId: randomUUID() }
      }
      next()
    })
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        stopAtFirstError: true,
        transform: true,
      }),
    )
    app.useGlobalFilters(new AllExceptionsFilter())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('valida payload e cria task com criador/time', async () => {
    const server = app.getHttpServer()

    // Faltando campos obrigatórios
    const badReq = await request(server)
      .post('/task')
      .send({ title: 'Sem campos' })
      .expect(400)
    expect(badReq.body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Erro de validação',
    })
    expect(Array.isArray(badReq.body.details)).toBe(true)

    // Cria usuários para criador e time
    const creatorRes = await request(server)
      .post('/user')
      .send({ name: 'Creator', email: genEmail(), role: 'editor' })
      .expect(201)
    const team1Res = await request(server)
      .post('/user')
      .send({ name: 'Team1', email: genEmail(), role: 'editor' })
      .expect(201)
    const team2Res = await request(server)
      .post('/user')
      .send({ name: 'Team2', email: genEmail(), role: 'editor' })
      .expect(201)

    const creatorId: string = creatorRes.body.id
    const teamIds: string[] = [team1Res.body.id, team2Res.body.id]

    // Criação da task
    const payload = {
      title: 'Primeira Task',
      description: 'Descrição inicial',
      creatorId,
      teamIds,
    }
    const createTask = await request(server).post('/task').send(payload).expect(201)

    expect(createTask.body).toHaveProperty('id')
    expect(createTask.body).toHaveProperty('title', payload.title)
    expect(createTask.body).toHaveProperty('description', payload.description)
    // status default "open"
    expect(createTask.body).toHaveProperty('status', 'open')
    // relações
    expect(createTask.body).toHaveProperty('creator.id', creatorId)
    expect(Array.isArray(createTask.body.team)).toBe(true)
    expect(createTask.body.team.map((u: any) => u.id).sort()).toEqual(teamIds.sort())

    const taskId: string = createTask.body.id

    // GET all deve conter a task criada
    const all = await request(server).get('/task').expect(200)
    expect(all.body).toHaveProperty('items')
    expect(all.body).toHaveProperty('total')
    expect(all.body).toHaveProperty('page')
    expect(all.body).toHaveProperty('limit')
    const ids = (Array.isArray(all.body.items) ? all.body.items : []).map((t: any) => t.id)
    expect(ids).toContain(taskId)

    // GET by id
    const byId = await request(server).get(`/task/${taskId}`).expect(200)
    expect(byId.body).toHaveProperty('id', taskId)
    expect(byId.body).toHaveProperty('creator.id', creatorId)
  })

  it('atualiza campos e relações e remove a task', async () => {
    const server = app.getHttpServer()

    // Usuários auxiliares
    const creatorRes = await request(server)
      .post('/user')
      .send({ name: 'Creator2', email: genEmail(), role: 'editor' })
      .expect(201)
    const teamARes = await request(server)
      .post('/user')
      .send({ name: 'TeamA', email: genEmail(), role: 'editor' })
      .expect(201)
    const teamBRes = await request(server)
      .post('/user')
      .send({ name: 'TeamB', email: genEmail(), role: 'editor' })
      .expect(201)

    // Cria task base
    const createTask = await request(server)
      .post('/task')
      .send({
        title: 'Task Update',
        description: 'Antes',
        creatorId: creatorRes.body.id,
        teamIds: [teamARes.body.id],
        status: 'open',
      })
      .expect(201)

    const taskId: string = createTask.body.id

    // Atualiza título, status, criador e time
    const upd = await request(server)
      .patch(`/task/${taskId}`)
      .send({
        title: 'Task Atualizada',
        status: 'inProgress',
        creatorId: creatorRes.body.id,
        teamIds: [teamARes.body.id, teamBRes.body.id],
      })
      .expect(200)

    expect(upd.body).toHaveProperty('id', taskId)
    expect(upd.body).toHaveProperty('title', 'Task Atualizada')
    expect(upd.body).toHaveProperty('status', 'inProgress')
    expect(upd.body).toHaveProperty('creator.id', creatorRes.body.id)
    expect((upd.body.team as any[]).map((u: any) => u.id).sort()).toEqual(
      [teamARes.body.id, teamBRes.body.id].sort(),
    )

    // Remove
    const del = await request(server).delete(`/task/${taskId}`).expect(200)
    expect(del.body).toHaveProperty('affected', 1)

    // GET after delete -> 404 payload
    const afterDel = await request(server).get(`/task/${taskId}`).expect(404)
    expect(afterDel.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Tarefa não encontrada',
    })
  })
})
