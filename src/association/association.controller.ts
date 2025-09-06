import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/error-response.dto';
import { AssociationService } from './association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { QueryAssociationDto } from './dto/query-association.dto';

@ApiTags('association')
@ApiBearerAuth('access-token')
@Controller('association')
export class AssociationController {
  constructor(private readonly associationService: AssociationService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos', type: ValidationErrorResponseDto })
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationService.create(createAssociationDto);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos', type: ValidationErrorResponseDto })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filtro por nome (contém)' })
  @ApiQuery({ name: 'cnpj', required: false, type: String, description: 'Filtro por CNPJ (contém)' })
  @ApiQuery({ name: 'status', required: false, type: Boolean, description: 'Filtrar por status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'name', 'cnpj', 'status'], description: 'Campo para ordenação' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Direção da ordenação' })
  findAll(@Query() query: QueryAssociationDto) {
    return this.associationService.findAll(query);
  }

  @Get('id/:id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Associação não encontrada', type: ErrorResponseDto })
  findOneById(@Param('id') id: string) {
    return this.associationService.findOneById(id);
  }

  @Get('cnpj/:cnpj')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Associação não encontrada', type: ErrorResponseDto })
  findOneCnpj(@Param('cnpj') cnpj: string) {
    return this.associationService.findOneByCnpj(cnpj);
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos', type: ValidationErrorResponseDto })
  update(@Param('id') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationService.update(id, updateAssociationDto);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.associationService.remove(id);
  }
}
