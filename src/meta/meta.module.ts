import { Module } from '@nestjs/common';
import { MetaController } from './meta.controller';
import { EnumsController } from './enums.controller';
import { StatusController } from './status.controller';

@Module({
  controllers: [MetaController, EnumsController, StatusController],
})
export class MetaModule {}
