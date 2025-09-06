import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { AssociationModule } from '../src/association/association.module';
import { Association } from '../src/association/entities/association.entity';

jest.setTimeout(30000);

describe('Association (e2e) - entidade atual e DTOs', () => {
  let app: INestApplication;
  const genCnpj14 = () => `${Math.floor(Math.random() * 1e14)}`.padStart(14, '0');

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
          entities: [Association],
          synchronize: true,
          dropSchema: true,
        }),
        AssociationModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  it('Cria associação com campos mínimos e valida CNPJ por formato', async () => {
    const server = app.getHttpServer();

    // Falha quando faltam campos obrigatórios
    await request(server)
      .post('/association')
      .send({ name: 'Sem CNPJ' })
      .expect(400);

    // Falha quando CNPJ não tem formato aceito
    await request(server)
      .post('/association')
      .send({ name: 'CNPJ inválido', cnpj: '123' })
      .expect(400);

    // Sucesso com formato válido (não valida dígitos verificadores)
    const payload = { name: 'Assoc OK', cnpj: genCnpj14() };
    const res = await request(server).post('/association').send(payload).expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', payload.name);
    expect(res.body).toHaveProperty('cnpj', payload.cnpj);
    // status padrão true
    expect(res.body.status ?? true).toBe(true);

    const id = res.body.id as string;

    // GET by id
    const byId = await request(server).get(`/association/id/${id}`).expect(200);
    expect(byId.body).toHaveProperty('id', id);

    // GET by cnpj (exato, sem normalização)
    const byCnpj = await request(server)
      .get(`/association/cnpj/${encodeURIComponent(payload.cnpj)}`)
      .expect(200);
    expect(byCnpj.body).toHaveProperty('id', id);
  });

  it('Atualiza name/status e remove associação', async () => {
    const server = app.getHttpServer();

    const created = await request(server)
      .post('/association')
      .send({ name: 'A Ser Atualizada', cnpj: genCnpj14() })
      .expect(201);
    const id = created.body.id as string;

    // Atualiza nome e status
    const upd = await request(server)
      .patch(`/association/${id}`)
      .send({ name: 'Atualizada', status: false })
      .expect(200);
    expect(upd.body.affected ?? 1).toBe(1);

    const afterUpd = await request(server).get(`/association/id/${id}`).expect(200);
    expect(afterUpd.body).toHaveProperty('name', 'Atualizada');
    expect(afterUpd.body).toHaveProperty('status', false);

    // Remove
    const del = await request(server).delete(`/association/${id}`).expect(200);
    expect(del.body.affected ?? 1).toBe(1);

    // Após remover, GET deve retornar 404 com payload de erro padronizado
    const afterDel = await request(server).get(`/association/id/${id}`).expect(404);
    expect(afterDel.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Associação não encontrada',
    })
  });
});
