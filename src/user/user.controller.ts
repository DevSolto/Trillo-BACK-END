import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/error-response.dto';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import type { Request } from 'express';

@ApiTags('user')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  @ApiConflictResponse({ description: 'Email already in use', type: ErrorResponseDto })
  create(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const { user } = req as any;
    const userId: string = user?.userId;
    const userEmail: string = user?.userEmail ?? createUserDto.email;
    if (!userId) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    return this.userService.create(userId, userEmail, createUserDto);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid query parameters', type: ValidationErrorResponseDto })
  @ApiOkResponse({
    description: 'Paginated list of users',
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
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name (contains)' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email (contains)' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'editor'], description: 'Filter by role' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Current page', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'name', 'email', 'role'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort direction' })
  findAll(@Query() query: any) {
    // alias perPage -> limit
    const q: QueryUserDto = { ...query }
    if (q && (q as any).perPage && !q.limit) {
      q.limit = Number((q as any).perPage)
    }
    return this.userService.findAll(q);
  }

  @Get('id/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  findOneById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data', type: ValidationErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Email already in use', type: ErrorResponseDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized', type: ErrorResponseDto })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
