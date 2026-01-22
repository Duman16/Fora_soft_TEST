import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { ConfigService } from '@nestjs/config';
  import { User } from '../users/entities/user.entity';
  import { RegisterDto, LoginDto } from './dto/auth.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      private jwtService: JwtService,
      private configService: ConfigService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      const { email, password, role } = registerDto;
  
      // Проверяем существует ли пользователь
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
  
      if (existingUser) {
        throw new BadRequestException('Пользователь с таким email уже существует');
      }
  
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Создаем пользователя
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        role,
      });
  
      await this.userRepository.save(user);
  
      // Генерируем токены
      const tokens = await this.generateTokens(user);
  
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        ...tokens,
      };
    }
  
    async login(loginDto: LoginDto) {
      const { email, password } = loginDto;
  
      // Ищем пользователя
      const user = await this.userRepository.findOne({
        where: { email },
      });
  
      if (!user) {
        throw new UnauthorizedException('Неверный email или пароль');
      }
  
      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Неверный email или пароль');
      }
  
      // Генерируем токены
      const tokens = await this.generateTokens(user);
  
      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        ...tokens,
      };
    }
  
    async refreshToken(refreshToken: string) {
      try {
        // Верифицируем refresh token
        const payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
  
        // Получаем пользователя
        const user = await this.userRepository.findOne({
          where: { id: payload.sub },
        });
  
        if (!user) {
          throw new UnauthorizedException('Пользователь не найден');
        }
  
        // Генерируем новые токены
        return await this.generateTokens(user);
      } catch (error) {
        throw new UnauthorizedException('Невалидный refresh token');
      }
    }
  
    private async generateTokens(user: User) {
      const payload = { email: user.email, sub: user.id, role: user.role };
  
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      });
  
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      });
  
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    }
  }