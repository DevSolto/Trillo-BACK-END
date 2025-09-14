import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'
import { TaskPriority, TaskStatus } from 'src/task/entities/task.entity'

@ApiTags('enums')
@Controller('enums')
export class EnumsController {
  @Get('priorities')
  @Public()
  @ApiOkResponse({
    description: 'List of task priorities',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskPriority) } },
  })
  getPrioridades() {
    return Object.values(TaskPriority)
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
