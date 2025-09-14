import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeedService } from './seed.service'
import { User } from 'src/user/entities/user.entity'
import { Task } from 'src/task/entities/task.entity'
import { Association } from 'src/association/entities/association.entity'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Task, Association])],
  providers: [SeedService],
})
export class SeedModule {}

