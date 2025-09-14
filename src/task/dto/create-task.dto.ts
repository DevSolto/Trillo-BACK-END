import { ArrayUnique, IsArray, IsDateString, IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { TaskPriority, TaskStatus } from '../entities/task.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title', example: 'Organize monthly meeting' })
  @IsString({ message: 'Título deve ser uma string' })
  @IsDefined({ message: 'Título é obrigatório' })
  @IsNotEmpty({ message: 'Título não pode estar vazio' })
  title: string

  @ApiProperty({ description: 'Detailed task description', example: 'Confirm location, participants and agenda' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsDefined({ message: 'Descrição é obrigatória' })
  @IsNotEmpty({ message: 'Descrição não pode estar vazia' })
  description: string

  @ApiPropertyOptional({ description: 'Initial task status', enum: TaskStatus, example: 'open' })
  @IsOptional()
  @IsEnum(TaskStatus, { message: `Status inválido. Valores permitidos: ${Object.values(TaskStatus).join(', ')}` })
  status?: TaskStatus

  @ApiPropertyOptional({ description: 'Task priority', enum: TaskPriority, example: 'medium' })
  @IsOptional()
  @IsEnum(TaskPriority, { message: `Prioridade inválida. Valores permitidos: ${Object.values(TaskPriority).join(', ')}` })
  priority?: TaskPriority

  @ApiPropertyOptional({ description: 'Due date (ISO 8601)', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString({}, { message: 'dueDate deve ser uma data ISO 8601 válida' })
  dueDate?: string

  @ApiProperty({ description: 'Task creator ID (UUID v4)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', { message: 'creatorId deve ser um UUID v4 válido' })
  @IsDefined({ message: 'creatorId é obrigatório' })
  creatorId: string

  @ApiProperty({ description: 'Association ID (UUID v4)', example: '4fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', { message: 'associationId deve ser um UUID v4 válido' })
  @IsDefined({ message: 'associationId é obrigatório' })
  associationId: string

  @ApiProperty({ description: 'Responsible team user IDs (UUID v4)', example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'] })
  @IsDefined({ message: 'teamIds é obrigatório (pode ser lista vazia)' })
  @IsArray({ message: 'teamIds deve ser um array' })
  @ArrayUnique({ message: 'teamIds não pode conter IDs duplicados' })
  @IsUUID('4', { each: true, message: 'Cada item de teamIds deve ser UUID v4 válido' })
  teamIds: string[]
}
