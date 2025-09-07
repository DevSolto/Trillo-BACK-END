import { IsIn, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { UserRole } from '../entities/user.entity'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryUserDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by name (contains)', example: 'Maria' })
  @IsOptional()
  @IsString({ message: 'name deve ser uma string' })
  name?: string

  @ApiPropertyOptional({ description: 'Filter by email (contains)', example: 'maria' })
  @IsOptional()
  @IsString({ message: 'email deve ser uma string' })
  email?: string

  @ApiPropertyOptional({ description: 'Filter by role', enum: UserRole, example: 'admin' })
  @IsOptional()
  @IsIn(Object.values(UserRole), { message: `role inválido. Permitidos: ${Object.values(UserRole).join(', ')}` })
  role?: UserRole

  @ApiPropertyOptional({ description: 'Sort field', enum: ['id', 'name', 'email', 'role'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'name', 'email', 'role'], { message: "sortBy inválido. Permitidos: 'id', 'name', 'email', 'role'" })
  sortBy?: 'id' | 'name' | 'email' | 'role' = 'id'

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: "sortOrder inválido. Permitidos: 'ASC', 'DESC', 'asc', 'desc'" })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
