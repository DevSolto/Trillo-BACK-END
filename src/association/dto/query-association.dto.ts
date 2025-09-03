import { IsBooleanString, IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryAssociationDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por nome (contém)', example: 'Bairro' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: 'Filtro por CNPJ (contém)', example: '12.345' })
  @IsOptional()
  @IsString()
  cnpj?: string

  @ApiPropertyOptional({ description: 'Filtrar por status', example: 'true' })
  @IsOptional()
  @IsBooleanString()
  status?: string

  @ApiPropertyOptional({ description: 'Campo para ordenação', enum: ['id', 'name', 'cnpj', 'status'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'name', 'cnpj', 'status'])
  sortBy?: 'id' | 'name' | 'cnpj' | 'status' = 'id'

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
