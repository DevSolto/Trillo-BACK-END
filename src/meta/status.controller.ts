import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'

@ApiTags('status')
@Controller('status')
export class StatusController {
  @Get()
  @Public()
  @ApiOkResponse({ description: 'Service status', schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } })
  status() {
    return { status: 'ok' }
  }
}
