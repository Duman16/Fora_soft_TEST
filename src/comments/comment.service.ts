import {Injectable,NotFoundException,ForbiddenException,BadRequestException,}
    from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository } from 'typeorm';
    import { Comment } from './entities/comment.entity';
    import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
    import { User } from '../users/entities/user.entity';
    import { Task } from '../tasks/entities/task.entity';
  
  @Injectable()
  export class CommentsService {
    constructor(
      @InjectRepository(Comment)
      private commentRepository: Repository<Comment>,
      @InjectRepository(Task)
      private taskRepository: Repository<Task>,
    ) {}
  
    async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
      const { taskId, text } = createCommentDto;
  
      // Проверяем существование задачи
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });
  
      if (!task) {
        throw new BadRequestException(`Задача с ID ${taskId} не найдена`);
      }
  
      const comment = this.commentRepository.create({
        task_id: taskId,
        user_id: user.id,
        text,
      });
  
      return await this.commentRepository.save(comment);
    }
  
    async findByTask(taskId: string): Promise<Comment[]> {
      // Проверяем существование задачи
      const task = await this.taskRepository.findOne({
        where: { id: taskId },
      });
  
      if (!task) {
        throw new NotFoundException(`Задача с ID ${taskId} не найдена`);
      }
  
      // Комментарии возвращаются отсортированными по дате (новые первыми)
      return await this.commentRepository.find({
        where: { task_id: taskId },
        relations: ['user', 'task'],
        order: {
          created_at: 'DESC',
        },
      });
    }
  
    async findOne(id: string): Promise<Comment> {
      const comment = await this.commentRepository.findOne({
        where: { id },
        relations: ['user', 'task'],
      });
  
      if (!comment) {
        throw new NotFoundException(`Комментарий с ID ${id} не найден`);
      }
  
      return comment;
    }
  
    async update(
      id: string,
      updateCommentDto: UpdateCommentDto,
      user: User,
    ): Promise<Comment> {
      const comment = await this.findOne(id);
  
      // Редактировать комментарий может только его автор
      if (comment.user_id !== user.id) {
        throw new ForbiddenException(
          'Вы не можете редактировать чужой комментарий',
        );
      }
  
      Object.assign(comment, updateCommentDto);
      return await this.commentRepository.save(comment);
    }
  
    async remove(id: string, user: User): Promise<void> {
      const comment = await this.findOne(id);
  
      // Удалять комментарий может только его автор
      if (comment.user_id !== user.id) {
        throw new ForbiddenException(
          'Вы не можете удалить чужой комментарий',
        );
      }
  
      await this.commentRepository.remove(comment);
    }
  }