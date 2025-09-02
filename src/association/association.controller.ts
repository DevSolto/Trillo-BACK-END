import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssociationService } from './association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';

@Controller('association')
export class AssociationController {
  constructor(private readonly associationService: AssociationService) {}

  @Post()
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationService.create(createAssociationDto);
  }

  @Get()
  findAll() {
    return this.associationService.findAll();
  }

  @Get('id/:id')
  findOneById(@Param('id') id: string) {
    return this.associationService.findOneById(id);
  }

  @Get('cnpj/:cnpj')
  findOneCnpj(@Param('cnpj') cnpj: string) {
    return this.associationService.findOneByCnpj(cnpj);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationService.update(id, updateAssociationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.associationService.remove(id);
  }
}
