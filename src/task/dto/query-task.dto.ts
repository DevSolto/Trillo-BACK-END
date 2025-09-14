import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { TaskPriority, TaskStatus } from '../entities/task.entity'
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

  @ApiPropertyOptional({ description: 'Filter by priority', enum: TaskPriority, example: 'medium' })
  @IsOptional()
  @IsIn(Object.values(TaskPriority), { message: `priority inválido. Permitidos: ${Object.values(TaskPriority).join(', ')}` })
  priority?: TaskPriority

  @ApiPropertyOptional({ description: 'Filter by creator (UUID)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID('4', { message: 'creatorId deve ser um UUID v4 válido' })
  creatorId?: string

  @ApiPropertyOptional({ description: 'Filter by association (UUID)', example: '4fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID('4', { message: 'associationId deve ser um UUID v4 válido' })
  associationId?: string

  @ApiPropertyOptional({ description: 'Sort field', enum: ['id', 'title', 'status', 'priority', 'createdAt', 'dueDate'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'title', 'status', 'priority', 'createdAt', 'dueDate'], { message: "sortBy inválido. Permitidos: 'id', 'title', 'status', 'priority', 'createdAt', 'dueDate'" })
  sortBy?: 'id' | 'title' | 'status' | 'priority' | 'createdAt' | 'dueDate' = 'id'

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: "sortOrder inválido. Permitidos: 'ASC', 'DESC', 'asc', 'desc'" })
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
