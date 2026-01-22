import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности API' })
  @ApiResponse({
    status: 200,
    description: 'API работает нормально',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-23T10:00:00.000Z',
        uptime: 123.456,
        database: 'connected',
      },
    },
  })
  async check() {
    // Проверяем подключение к БД
    let dbStatus = 'disconnected';
    try {
      await this.userRepository.query('SELECT 1');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}