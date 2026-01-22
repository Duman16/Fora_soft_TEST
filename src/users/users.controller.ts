import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,HttpCode,HttpStatus,}
    from '@nestjs/common';
    import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
    import { UsersService } from './users.service';
    import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
    import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  
  @ApiTags('Пользователи')
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Создать пользователя' })
    @ApiResponse({ status: 201, description: 'Пользователь создан' })
    @ApiResponse({ status: 400, description: 'Невалидные данные' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async create(@Body() createUserDto: CreateUserDto) {
      const user = await this.usersService.create(createUserDto);
      // Не возвращаем пароль
      const { password, ...result } = user;
      return result;
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить список всех пользователей' })
    @ApiResponse({ status: 200, description: 'Список пользователей' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async findAll() {
      const users = await this.usersService.findAll();
      // Не возвращаем пароли
      return users.map(user => {
        const { password, ...result } = user;
        return result;
      });
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить пользователя по ID' })
    @ApiResponse({ status: 200, description: 'Пользователь найден' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async findOne(@Param('id') id: string) {
      const user = await this.usersService.findOne(id);
      const { password, ...result } = user;
      return result;
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Редактировать пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь обновлен' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      const user = await this.usersService.update(id, updateUserDto);
      const { password, ...result } = user;
      return result;
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiResponse({ status: 204, description: 'Пользователь удален' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
    async remove(@Param('id') id: string) {
      await this.usersService.remove(id);
    }
  }