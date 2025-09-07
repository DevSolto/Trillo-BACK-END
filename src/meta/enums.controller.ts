import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { Public } from 'src/auth/public.decorator'
import { TaskStatus, TaskType } from 'src/task/entities/task.entity'

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
    description: 'List of task types',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskType) } },
  })
  getTipos() {
    // Return available task types
    return Object.values(TaskType)
  }
}
