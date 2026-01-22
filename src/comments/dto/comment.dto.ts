import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'uuid-of-task' })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({ 
    example: 'Это комментарий к задаче',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, { message: 'Текст комментария должен быть от 1 до 1000 символов' })
  text: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ 
    example: 'Обновленный текст комментария',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  @Length(1, 1000, { message: 'Текст комментария должен быть от 1 до 1000 символов' })
  text?: string;
}