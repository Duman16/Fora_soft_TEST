import {Controller,Get,Post,Body,Patch,Param,Delete,Query,UseGuards,HttpCode,HttpStatus,}
from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Комментарии')
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Создать комментарий (только для роли "author")' })
  @ApiResponse({ status: 201, description: 'Комментарий создан' })
  @ApiResponse({ status: 400, description: 'Невалидные данные или задача не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (требуется роль author)' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.create(createCommentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список комментариев к задаче' })
  @ApiQuery({ name: 'task_id', required: true, description: 'UUID задачи' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список комментариев (отсортированы по дате, новые первыми)' 
  })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findByTask(@Query('task_id') taskId: string) {
    return await this.commentsService.findByTask(taskId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiResponse({ status: 200, description: 'Комментарий найден' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Редактировать комментарий (только свой)' })
  @ApiResponse({ status: 200, description: 'Комментарий обновлен' })
  @ApiResponse({ status: 403, description: 'Нельзя редактировать чужой комментарий' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.update(id, updateCommentDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий (только свой)' })
  @ApiResponse({ status: 204, description: 'Комментарий удален' })
  @ApiResponse({ status: 403, description: 'Нельзя удалить чужой комментарий' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.commentsService.remove(id, user);
  }
}