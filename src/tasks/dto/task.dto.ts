import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ 
    example: 'Разработать REST API для CRM системы',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, { message: 'Описание должно быть от 1 до 1000 символов' })
  description: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ 
    example: 'Обновленное описание задачи',
    minLength: 1,
    maxLength: 1000
  })
  @IsString()
  @IsOptional()
  @Length(1, 1000, { message: 'Описание должно быть от 1 до 1000 символов' })
  description?: string;
}