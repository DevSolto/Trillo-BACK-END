import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/auth/public.decorator';
import { QueryUserDto } from './dto/query-user.dto';

@ApiTags('user')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Lista paginada de usuários',
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
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filtro por nome (contém)' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filtro por e-mail (contém)' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'editor'], description: 'Filtrar por papel' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página atual', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página', example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['id', 'name', 'email', 'role'], description: 'Campo para ordenação' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Direção da ordenação' })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get('id/:id')
  findOneById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
