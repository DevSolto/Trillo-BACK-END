import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TaskStatus } from 'src/task/entities/task.entity';
import { UserRole } from 'src/user/entities/user.entity';

@ApiTags('meta')
@ApiBearerAuth('access-token')
@Controller('meta')
export class MetaController {
  @Get('enums/user-roles')
  @ApiOkResponse({
    description: 'Lista de valores do enum UserRole',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(UserRole) } },
  })
  getUserRoles() {
    return Object.values(UserRole);
  }

  @Get('enums/task-status')
  @ApiOkResponse({
    description: 'Lista de valores do enum TaskStatus',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
  })
  getTaskStatus() {
    return Object.values(TaskStatus);
  }

  @Get('enums')
  @ApiOkResponse({
    description: 'Objeto com listas dos enums usados nos selects',
    schema: {
      type: 'object',
      properties: {
        userRoles: { type: 'array', items: { type: 'string', enum: Object.values(UserRole) } },
        taskStatus: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
      },
    },
  })
  getAllEnums() {
    return {
      userRoles: Object.values(UserRole),
      taskStatus: Object.values(TaskStatus),
    };
  }
}

