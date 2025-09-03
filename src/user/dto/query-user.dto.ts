import { IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { UserRole } from '../entities/user.entity'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por nome (contém)', example: 'Maria' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: 'Filtro por e-mail (contém)', example: 'maria' })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({ description: 'Filtrar por papel', enum: UserRole, example: 'admin' })
  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole

  @ApiPropertyOptional({ description: 'Campo para ordenação', enum: ['id', 'name', 'email', 'role'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'name', 'email', 'role'])
  sortBy?: 'id' | 'name' | 'email' | 'role' = 'id'

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
