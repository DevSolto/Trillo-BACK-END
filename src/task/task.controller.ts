import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/error-response.dto';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@ApiTags('task')
@ApiBearerAuth('access-token')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos', type: ValidationErrorResponseDto })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos', type: ValidationErrorResponseDto })
  @ApiOkResponse({
    description: 'Lista paginada de tarefas',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'object' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        pageCount: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filtro por título (contém)' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'inProgress', 'finished', 'canceled'], description: 'Filtrar por status' })
  @ApiQuery({ name: 'creatorId', required: false, type: String, description: 'Filtrar por criador (UUID)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'title', 'status'], description: 'Campo para ordenação' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Direção da ordenação' })
  findAll(@Query() query: QueryTaskDto) {
    return this.taskService.findAll(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Tarefa não encontrada', type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos', type: ValidationErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Tarefa não encontrada', type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Não autenticado', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
