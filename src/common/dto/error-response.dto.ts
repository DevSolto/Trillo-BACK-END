import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponseDto {
  @ApiProperty({ example: 401, description: 'Código HTTP do erro' })
  statusCode: number

  @ApiProperty({ example: 'UNAUTHORIZED', description: 'Código interno padronizado do erro' })
  code: string

  @ApiProperty({ example: 'Não autenticado', description: 'Mensagem de erro legível' })
  message: string

  @ApiProperty({ example: '/task', description: 'Caminho da requisição' })
  path: string

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', description: 'Timestamp do erro' })
  timestamp: string
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    example: [
      'title deve ser uma string',
      "status inválido. Valores permitidos: open, inProgress, finished, canceled",
    ],
    description: 'Lista de mensagens de validação',
  })
  details: string[]
}

