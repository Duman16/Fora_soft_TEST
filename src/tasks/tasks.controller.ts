import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,HttpCode,HttpStatus,}
from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Задачи')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Создать задачу (только для роли "user")' })
  @ApiResponse({ status: 201, description: 'Задача создана' })
  @ApiResponse({ status: 400, description: 'Невалидные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль user)' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех задач (отсортированы по дате, новые первыми)' })
  @ApiResponse({ status: 200, description: 'Список задач' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll() {
    return await this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по ID' })
  @ApiResponse({ status: 200, description: 'Задача найдена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findOne(@Param('id') id: string) {
    return await this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать задачу' })
  @ApiResponse({ status: 200, description: 'Задача обновлена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiResponse({ status: 204, description: 'Задача удалена' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id') id: string) {
    await this.tasksService.remove(id);
  }
}