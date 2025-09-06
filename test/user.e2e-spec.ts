import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { UserModule } from '../src/user/user.module';
import { User } from '../src/user/entities/user.entity';
import { Task } from '../src/task/entities/task.entity';

jest.setTimeout(30000);

describe('User CRUD (e2e)', () => {
  let app: INestApplication;

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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Injeta req.user para compatibilizar com o novo fluxo (sem JWT no teste)
    app.use((req: any, _res: any, next: any) => {
      if (req.method === 'POST' && req.path.startsWith('/user')) {
        req.user = { userId: randomUUID() };
      }
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        stopAtFirstError: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, reads, updates and deletes a user', async () => {
    const server = app.getHttpServer();

    // Snapshot initial count to ensure no residue
    const initialListRes = await request(server).get('/user').expect(200);
    expect(initialListRes.body).toHaveProperty('items');
    expect(initialListRes.body).toHaveProperty('total');
    const initialCount: number = Array.isArray(initialListRes.body.items)
      ? initialListRes.body.items.length
      : 0;

    const createPayload = {
      name: 'Alice Test',
      email: `alice_${Date.now()}@example.com`,
      role: 'editor',
    };

    // Create
    const createRes = await request(server)
      .post('/user')
      .send(createPayload)
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.name).toBe(createPayload.name);
    expect(createRes.body.email).toBe(createPayload.email);
    const id = createRes.body.id as string;

    // Read by email
    const getByEmailRes = await request(server)
      .get(`/user/email/${encodeURIComponent(createPayload.email)}`)
      .expect(200);
    expect(getByEmailRes.body).toHaveProperty('id', id);

    // Read by id
    const getByIdRes = await request(server)
      .get(`/user/id/${id}`)
      .expect(200);
    expect(getByIdRes.body).toHaveProperty('email', createPayload.email);

    // Update
    const updatePayload = { name: 'Alice Updated' };
    const updateRes = await request(server)
      .patch(`/user/${id}`)
      .send(updatePayload)
      .expect(200);
    // TypeORM UpdateResult: ensure one row affected
    expect(updateRes.body).toHaveProperty('affected', 1);

    // Verify update
    const verifyUpdateRes = await request(server)
      .get(`/user/id/${id}`)
      .expect(200);
    expect(verifyUpdateRes.body).toHaveProperty('name', updatePayload.name);

    // Delete
    const deleteRes = await request(server)
      .delete(`/user/${id}`)
      .expect(200);
    expect(deleteRes.body).toHaveProperty('affected', 1);

    // Ensure the deleted user is not present anymore
    const listRes = await request(server)
      .get('/user')
      .expect(200);
    expect(listRes.body).toHaveProperty('items');
    expect(Array.isArray(listRes.body.items)).toBe(true);
    const ids: string[] = listRes.body.items.map((u: any) => u.id);
    expect(ids).not.toContain(id);

    // GET by id after delete -> 404 with standardized payload
    const byIdAfterDel = await request(server)
      .get(`/user/id/${id}`)
      .expect(404);
    expect(byIdAfterDel.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Usuário não encontrado',
    });

    // GET by email after delete -> 404 with standardized payload
    const byEmailAfterDel = await request(server)
      .get(`/user/email/${encodeURIComponent(createPayload.email)}`)
      .expect(404);
    expect(byEmailAfterDel.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Usuário não encontrado',
    });
  });
});
