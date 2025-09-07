import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAssociationDto {
  @ApiProperty({ description: 'Association name', example: 'Neighborhood Happy Association' })
  @IsString({ message: 'Nome deve ser uma string' })
  @IsDefined({ message: 'Nome é obrigatório' })
  @IsNotEmpty({ message: 'Nome não pode estar vazio' })
  name: string

  @ApiProperty({ description: 'Association CNPJ', example: '12.345.678/0001-90' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsDefined({ message: 'CNPJ é obrigatório' })
  @IsNotEmpty({ message: 'CNPJ não pode estar vazio' })
  @Matches(/^(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, {
    message: 'CNPJ inválido. Use 14 dígitos ou 00.000.000/0000-00',
  })
  cnpj: string

  @ApiPropertyOptional({ description: 'Active/inactive status', example: true, default: true })
  @IsOptional()
  @IsBoolean({ message: 'Status deve ser booleano' })
  status?: boolean
}
