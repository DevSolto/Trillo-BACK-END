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
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationService.create(createAssociationDto);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters', type: ValidationErrorResponseDto })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)' })
  @ApiQuery({ name: 'cnpj', required: false, type: String, description: 'Filter by CNPJ (contains)' })
  @ApiQuery({ name: 'status', required: false, type: Boolean, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Current page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'name', 'cnpj', 'status'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort direction' })
  findAll(@Query() query: any) {
    // alias perPage -> limit
    const q: QueryAssociationDto = { ...query }
    if (q && (q as any).perPage && !q.limit) {
      q.limit = Number((q as any).perPage)
    }
    return this.associationService.findAll(q);
  }

  @Get('id/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Association not found', type: ErrorResponseDto })
  findOneById(@Param('id') id: string) {
    return this.associationService.findOneById(id);
  }

  @Get('cnpj/:cnpj')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Association not found', type: ErrorResponseDto })
  findOneCnpj(@Param('cnpj') cnpj: string) {
    return this.associationService.findOneByCnpj(cnpj);
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  update(@Param('id') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationService.update(id, updateAssociationDto);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.associationService.remove(id);
  }
}
