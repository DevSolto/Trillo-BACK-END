import { IsDefined, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsDefined({ message: 'E-mail é obrigatório' })
  @IsNotEmpty({ message: 'E-mail não pode estar vazio' })
  email: string

  @IsString({ message: 'Senha deve ser uma string' })
  @IsDefined({ message: 'Senha é obrigatória' })
  @IsNotEmpty({ message: 'Senha não pode estar vazia' })
  password: string
}
