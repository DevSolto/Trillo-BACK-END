import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'

@ApiTags('status')
@Controller('status')
export class StatusController {
  @Get()
  @Public()
  @ApiOkResponse({ description: 'Status do serviço', schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } })
  status() {
    return { status: 'ok' }
  }
}

