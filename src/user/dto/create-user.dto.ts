import { IsString, IsEmail, IsEnum, IsDefined, IsNotEmpty } from 'class-validator'
import { UserRole } from '../entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
    @ApiProperty({ description: 'Nome do usuário', example: 'Maria Silva' })
    @IsString({ message: 'Nome deve ser uma string' })
    @IsDefined({ message: 'Nome é obrigatório' })
    @IsNotEmpty({ message: 'Nome não pode estar vazio' })
    name: string

    @ApiProperty({ description: 'E-mail do usuário', example: 'maria@email.com' })
    @IsEmail({}, { message: 'E-mail inválido' })
    @IsDefined({ message: 'E-mail é obrigatório' })
    @IsNotEmpty({ message: 'E-mail não pode estar vazio' })
    email: string

    @ApiProperty({ description: 'Perfil do usuário', enum: UserRole, example: 'admin' })
    @IsEnum(UserRole, { message: `Função inválida. Valores permitidos: ${Object.values(UserRole).join(', ')}` })
    @IsDefined({ message: 'Função é obrigatória' })
    @IsNotEmpty({ message: 'Função não pode estar vazia' })
    role: UserRole
}
