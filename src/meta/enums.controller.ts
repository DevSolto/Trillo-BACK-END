import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'
import { TaskStatus } from 'src/task/entities/task.entity'

@ApiTags('enums')
@Controller('enums')
export class EnumsController {
  @Get('priorities')
  @Public()
  @ApiOkResponse({
    description: 'List of priorities (placeholder)',
    schema: { type: 'array', items: { type: 'string' }, example: ['low', 'medium', 'high'] },
  })
  getPrioridades() {
    // Ajuste se houver enum real de prioridades no domínio
    return ['low', 'medium', 'high']
  }

  @Get('types')
  @Public()
  @ApiOkResponse({
    description: 'List of types (temporarily mapped to task status)',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
  })
  getTipos() {
    // Ajuste quando existir enum/entidade de tipos específico
    return Object.values(TaskStatus)
  }
}
