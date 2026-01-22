import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ 
    status: 201, 
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          role: 'user'
        },
        access_token: 'jwt_token',
        refresh_token: 'refresh_jwt_token'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Пользователь уже существует' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'user@example.com',
          role: 'user'
        },
        access_token: 'jwt_token',
        refresh_token: 'refresh_jwt_token'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Токен успешно обновлен',
    schema: {
      example: {
        access_token: 'new_jwt_token',
        refresh_token: 'new_refresh_jwt_token'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Невалидный refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }
}