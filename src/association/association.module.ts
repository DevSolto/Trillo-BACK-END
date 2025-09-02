import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssociationService } from './association.service';
import { AssociationController } from './association.controller';
import { Association } from './entities/association.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Association])],
  controllers: [AssociationController],
  providers: [AssociationService],
  exports: [],
})
export class AssociationModule {}
