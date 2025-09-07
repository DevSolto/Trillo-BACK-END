import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { TaskStatus } from '../entities/task.entity'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryTaskDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by title (contains)', example: 'meeting' })
  @IsOptional()
  @IsString({ message: 'title deve ser uma string' })
  title?: string

  @ApiPropertyOptional({ description: 'Filter by status', enum: TaskStatus, example: 'open' })
  @IsOptional()
  @IsIn(Object.values(TaskStatus), { message: `status inválido. Permitidos: ${Object.values(TaskStatus).join(', ')}` })
  status?: TaskStatus

  @ApiPropertyOptional({ description: 'Filter by creator (UUID)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID('4', { message: 'creatorId deve ser um UUID v4 válido' })
  creatorId?: string

  @ApiPropertyOptional({ description: 'Sort field', enum: ['id', 'title', 'status', 'createdAt', 'dueDate'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'title', 'status', 'createdAt', 'dueDate'], { message: "sortBy inválido. Permitidos: 'id', 'title', 'status', 'createdAt', 'dueDate'" })
  sortBy?: 'id' | 'title' | 'status' | 'createdAt' | 'dueDate' = 'id'

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: "sortOrder inválido. Permitidos: 'ASC', 'DESC', 'asc', 'desc'" })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
