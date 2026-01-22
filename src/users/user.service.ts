import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { User } from './entities/user.entity';
  import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
    ) {}
  
    async create(createUserDto: CreateUserDto): Promise<User> {
      const { email, password, role, task_id } = createUserDto;
  
      // Проверяем существование пользователя
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
  
      if (existingUser) {
        throw new BadRequestException('Пользователь с таким email уже существует');
      }
  
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        role,
        task_id,
      });
  
      return await this.userRepository.save(user);
    }
  
    async findAll(): Promise<User[]> {
      return await this.userRepository.find({
        relations: ['task', 'comments'],
      });
    }
  
    async findOne(id: string): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['task', 'comments'],
      });
  
      if (!user) {
        throw new NotFoundException(`Пользователь с ID ${id} не найден`);
      }
  
      return user;
    }
  
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.findOne(id);
  
      // Если обновляется email, проверяем уникальность
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });
  
        if (existingUser) {
          throw new BadRequestException('Пользователь с таким email уже существует');
        }
      }
  
      // Если обновляется пароль, хешируем его
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
  
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    }
  
    async remove(id: string): Promise<void> {
      const user = await this.findOne(id);
      await this.userRepository.remove(user);
    }
  }