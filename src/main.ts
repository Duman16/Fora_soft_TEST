import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'module-alias/register';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем валидацию глобально
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет поля не описанные в DTO
      forbidNonWhitelisted: true, // Выдает ошибку при лишних полях
      transform: true, // Автоматически преобразует типы
    }),
  );

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('CRM Task Comments API')
    .setDescription('REST API модуль "Комментарии к задачам" для CRM-системы')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Аутентификация', 'Регистрация, вход и обновление токенов')
    .addTag('Пользователи', 'CRUD операции с пользователями')
    .addTag('Задачи', 'CRUD операции с задачами')
    .addTag('Комментарии', 'CRUD операции с комментариями')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Сохраняет токен после обновления страницы
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 CRM Task Comments API запущен                   ║
  ║                                                       ║
  ║   📝 API:     http://localhost:${port}                    ║
  ║   📚 Swagger: http://localhost:${port}/api                ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();