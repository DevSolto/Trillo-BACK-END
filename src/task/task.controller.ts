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
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters', type: ValidationErrorResponseDto })
  @ApiOkResponse({
    description: 'Paginated list of tasks',
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
  @ApiQuery({ name: 'title', required: false, type: String, description: 'Filter by title (contains)' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'inProgress', 'finished', 'canceled'], description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, enum: ['general', 'bug', 'feature', 'improvement', 'meeting'], description: 'Filter by task type' })
  @ApiQuery({ name: 'creatorId', required: false, type: String, description: 'Filter by creator (UUID)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Current page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'title', 'status', 'type', 'createdAt', 'dueDate'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort direction' })
  findAll(@Query() query: QueryTaskDto) {
    return this.taskService.findAll(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Task not found', type: ErrorResponseDto })
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  @ApiNotFoundResponse({ description: 'Task not found', type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }
}
