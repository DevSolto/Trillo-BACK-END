import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateAssociationDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsDefined({ message: 'Nome é obrigatório' })
  @IsNotEmpty({ message: 'Nome não pode estar vazio' })
  name: string

  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsDefined({ message: 'CNPJ é obrigatório' })
  @IsNotEmpty({ message: 'CNPJ não pode estar vazio' })
  @Matches(/^(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/, {
    message: 'CNPJ inválido. Use 14 dígitos ou 00.000.000/0000-00',
  })
  cnpj: string

  @IsOptional()
  @IsBoolean({ message: 'Status deve ser booleano' })
  status?: boolean
}
