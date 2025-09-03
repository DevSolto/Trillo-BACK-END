import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { TaskStatus } from '../entities/task.entity'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QueryTaskDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtro por título (contém)', example: 'reunião' })
  @IsOptional()
  @IsString()
  title?: string

  @ApiPropertyOptional({ description: 'Filtrar por status', enum: TaskStatus, example: 'open' })
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  status?: TaskStatus

  @ApiPropertyOptional({ description: 'Filtrar por criador (UUID)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  creatorId?: string

  @ApiPropertyOptional({ description: 'Campo para ordenação', enum: ['id', 'title', 'status'], default: 'id' })
  @IsOptional()
  @IsIn(['id', 'title', 'status'])
  sortBy?: 'id' | 'title' | 'status' = 'id'

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC'
}
