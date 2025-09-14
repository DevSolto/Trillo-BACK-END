import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationModule } from './association/association.module';
import { TaskModule } from './task/task.module';
import { AuthModule } from './auth/auth.module';
import { MetaModule } from './meta/meta.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') ?? '5433', 10),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AssociationModule,
    TaskModule,
    AuthModule,
    MetaModule,
    SeedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
