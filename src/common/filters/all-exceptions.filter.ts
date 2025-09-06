import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const timestamp = new Date().toISOString()
    const path = request?.url

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res: any = exception.getResponse()

      // Validation Pipe errors usually send: { statusCode, message: string[], error }
      const isValidation = status === HttpStatus.BAD_REQUEST && Array.isArray(res?.message)

      const body = isValidation
        ? {
            statusCode: status,
            code: 'VALIDATION_ERROR',
            message: 'Erro de validação',
            details: res.message,
            path,
            timestamp,
          }
        : {
            statusCode: status,
            code: this.mapHttpCode(exception),
            message: typeof res === 'string' ? res : res?.message ?? exception.message,
            path,
            timestamp,
          }

      return response.status(status).json(body)
    }

    // Unknown error
    const status = HttpStatus.INTERNAL_SERVER_ERROR
    return response.status(status).json({
      statusCode: status,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
      path,
      timestamp,
    })
  }

  private mapHttpCode(exception: HttpException): string {
    const name = exception.constructor.name
    switch (name) {
      case 'BadRequestException':
        return 'BAD_REQUEST'
      case 'UnauthorizedException':
        return 'UNAUTHORIZED'
      case 'ForbiddenException':
        return 'FORBIDDEN'
      case 'NotFoundException':
        return 'NOT_FOUND'
      case 'ConflictException':
        return 'CONFLICT'
      case 'UnprocessableEntityException':
        return 'UNPROCESSABLE_ENTITY'
      default:
        return 'HTTP_ERROR'
    }
  }
}

