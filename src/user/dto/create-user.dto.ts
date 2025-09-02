import { IsString, IsEmail, IsStrongPassword, IsEnum, IsDefined, IsNotEmpty } from 'class-validator'
import { UserRole } from '../entities/user.entity'

export class CreateUserDto {
    @IsString({ message: 'Nome deve ser uma string' })
    @IsDefined({ message: 'Nome é obrigatório' })
    @IsNotEmpty({ message: 'Nome não pode estar vazio' })
    name: string

    @IsEmail({}, { message: 'E-mail inválido' })
    @IsDefined({ message: 'E-mail é obrigatório' })
    @IsNotEmpty({ message: 'E-mail não pode estar vazio' })
    email: string

    @IsStrongPassword({}, { message: 'Senha fraca: mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo' })
    @IsDefined({ message: 'Senha é obrigatória' })
    @IsNotEmpty({ message: 'Senha não pode estar vazia' })
    password: string

    @IsEnum(UserRole, { message: `Função inválida. Valores permitidos: ${Object.values(UserRole).join(', ')}` })
    @IsDefined({ message: 'Função é obrigatória' })
    @IsNotEmpty({ message: 'Função não pode estar vazia' })
    role: UserRole
}
