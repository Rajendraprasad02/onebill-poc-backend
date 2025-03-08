import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { promises } from 'dns';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }
  async findAll(isAuth: boolean = false): Promise<User[]> {
    return this.userRepository.find({
      select: isAuth
        ? ['id', 'username', 'email', 'password', 'salt']
        : ['id', 'username', 'email'],
    });
  }
  async findOne(
    username: string,
    isAuth: boolean = false,
  ): Promise<User | undefined> {
    console.log('hii');
    let users = await this.findAll(isAuth);
    console.log(users);
    return (await users).find((user) => user.username === username);
  }
}
