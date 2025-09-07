import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { TaskStatus, TaskType } from 'src/task/entities/task.entity';
import { UserRole } from 'src/user/entities/user.entity';
import { Public } from 'src/auth/public.decorator';

@ApiTags('meta')
@ApiBearerAuth('access-token')
@Controller('meta')
export class MetaController {
  @Get('enums/user-roles')
  @Public()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiOkResponse({
    description: 'List of values for the UserRole enum',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(UserRole) } },
  })
  getUserRoles() {
    return Object.values(UserRole);
  }

  @Get('enums/task-status')
  @Public()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiOkResponse({
    description: 'List of values for the TaskStatus enum',
    schema: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
  })
  getTaskStatus() {
    return Object.values(TaskStatus);
  }

  @Get('enums')
  @Public()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiOkResponse({
    description: 'Object with lists of enums used in selects',
    schema: {
      type: 'object',
      properties: {
        userRoles: { type: 'array', items: { type: 'string', enum: Object.values(UserRole) } },
        taskStatus: { type: 'array', items: { type: 'string', enum: Object.values(TaskStatus) } },
        taskTypes: { type: 'array', items: { type: 'string', enum: Object.values(TaskType) } },
      },
    },
  })
  getAllEnums() {
    return {
      userRoles: Object.values(UserRole),
      taskStatus: Object.values(TaskStatus),
      taskTypes: Object.values(TaskType),
    };
  }
}
