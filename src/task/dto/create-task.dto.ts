import { ArrayUnique, IsArray, IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { TaskStatus } from '../entities/task.entity'

export class CreateTaskDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsDefined({ message: 'Título é obrigatório' })
  @IsNotEmpty({ message: 'Título não pode estar vazio' })
  title: string

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsDefined({ message: 'Descrição é obrigatória' })
  @IsNotEmpty({ message: 'Descrição não pode estar vazia' })
  description: string

  @IsOptional()
  @IsEnum(TaskStatus, { message: `Status inválido. Valores permitidos: ${Object.values(TaskStatus).join(', ')}` })
  status?: TaskStatus

  @IsUUID('4', { message: 'creatorId deve ser um UUID v4 válido' })
  @IsDefined({ message: 'creatorId é obrigatório' })
  creatorId: string

  @IsDefined({ message: 'teamIds é obrigatório (pode ser lista vazia)' })
  @IsArray({ message: 'teamIds deve ser um array' })
  @ArrayUnique({ message: 'teamIds não pode conter IDs duplicados' })
  @IsUUID('4', { each: true, message: 'Cada item de teamIds deve ser UUID v4 válido' })
  teamIds: string[]
}
