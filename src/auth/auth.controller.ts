import { Controller, Post, Body } from '@nestjs/common';
import { ApiBadRequestResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/login-auth.dto';
import { Public } from './public.decorator';
import { ErrorResponseDto, ValidationErrorResponseDto } from 'src/common/dto/error-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @ApiBadRequestResponse({ description: 'Dados inválidos', type: ValidationErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Login local desativado', type: ErrorResponseDto })
  login(@Body() dto: CreateAuthDto) {
    return this.authService.login(dto)
  }
}
