import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'
import { TaskStatus } from 'src/task/entities/task.entity'

@ApiTags('enums')
@Controller('enums')
export class EnumsController {
  @Get('prioridades')
  @Public()
  @ApiOkResponse({
    description: 'Lista de prioridades (placeholder)',
    schema: { type: 'array', items: { type: 'string' }, example: ['baixa', 'media', 'alta'] },
  })
  getPrioridades() {
    // Ajuste se houver enum real de prioridades no domínio
    return ['baixa', 'media', 'alta']
  }

  @Get('tipos')
  @Public()
  @ApiOkResponse({
    description: 'Lista de tipos (mapeado para status de tarefa por ora)',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
  })
  getTipos() {
    // Ajuste quando existir enum/entidade de tipos específico
    return Object.values(TaskStatus)
  }
}

