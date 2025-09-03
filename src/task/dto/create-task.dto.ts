import { ArrayUnique, IsArray, IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { TaskStatus } from '../entities/task.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaskDto {
  @ApiProperty({ description: 'Título da tarefa', example: 'Organizar reunião mensal' })
  @IsString({ message: 'Título deve ser uma string' })
  @IsDefined({ message: 'Título é obrigatório' })
  @IsNotEmpty({ message: 'Título não pode estar vazio' })
  title: string

  @ApiProperty({ description: 'Descrição detalhada da tarefa', example: 'Confirmar local, participantes e pauta' })
  @IsString({ message: 'Descrição deve ser uma string' })
  @IsDefined({ message: 'Descrição é obrigatória' })
  @IsNotEmpty({ message: 'Descrição não pode estar vazia' })
  description: string

  @ApiPropertyOptional({ description: 'Status inicial da tarefa', enum: TaskStatus, example: 'open' })
  @IsOptional()
  @IsEnum(TaskStatus, { message: `Status inválido. Valores permitidos: ${Object.values(TaskStatus).join(', ')}` })
  status?: TaskStatus

  @ApiProperty({ description: 'ID do criador da tarefa (UUID v4)', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID('4', { message: 'creatorId deve ser um UUID v4 válido' })
  @IsDefined({ message: 'creatorId é obrigatório' })
  creatorId: string

  @ApiProperty({ description: 'IDs das equipes responsáveis (UUID v4)', example: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'] })
  @IsDefined({ message: 'teamIds é obrigatório (pode ser lista vazia)' })
  @IsArray({ message: 'teamIds deve ser um array' })
  @ArrayUnique({ message: 'teamIds não pode conter IDs duplicados' })
  @IsUUID('4', { each: true, message: 'Cada item de teamIds deve ser UUID v4 válido' })
  teamIds: string[]
}
