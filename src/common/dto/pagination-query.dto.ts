import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Página atual', example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @Min(1, { message: 'Página mínima é 1' })
  page?: number = 1

  @ApiPropertyOptional({ description: 'Itens por página', example: 10, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Itens por página deve ser um número inteiro' })
  @Min(1, { message: 'Itens por página mínimo é 1' })
  @Max(100, { message: 'Itens por página máximo é 100' })
  limit?: number = 10
}
