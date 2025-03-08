import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../users/user/user.service';
import { JwtService } from '@nestjs/jwt';

import { MESSAGES } from '../../constants/messages.constants';
import { User } from '../users/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, SetPasswordDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from 'common/modules/services/crypt.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  // async signIn(
  //   username: string,
  //   pass: string,
  // ): Promise<{ accessToken: string; refreshToken?: string }> {
  //   try {
  //     const lowerUserName = username.toLocaleLowerCase();
  //     const user = await this.usersService.findOne(lowerUserName, true);
  //     const isPasswordValid = this.cryptoService.verifyPassword(
  //       pass,
  //       user.password,
  //       user.salt,
  //     );

  //     if (!isPasswordValid) {
  //       throw new UnauthorizedException(MESSAGES.UNAUTHORIZED_ACCESS);
  //     }
  //     const payload = { userId: user.id, username: user.username };

  //     const accessToken = await this.jwtService.signAsync(payload);
  //     const isRefreshTokenEnable =
  //       this.configService.get<string>('ISREFRESH_TOKEN');
  //     const refreshToken =
  //       isRefreshTokenEnable === 'true'
  //         ? await this.jwtService.signAsync(payload, {
  //             expiresIn: this.configService.get<string>(
  //               'REFRESH_TOKEN_EXPIRES_IN',
  //             ),
  //           })
  //         : null;

  //     return refreshToken ? { accessToken, refreshToken } : { accessToken };
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async signIn(
    username: string,
    pass?: string, // Password is optional (for Google OAuth users)
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const lowerUserName = username.toLowerCase();
      const user = await this.usersService.findOne(lowerUserName, true);

      if (!user) {
        throw new UnauthorizedException(MESSAGES?.UNAUTHORIZED_ACCESS);
      }

      // If the user has no password (Google OAuth), deny password-based login
      if (!user.password && pass) {
        throw new UnauthorizedException(
          'This account is linked to Google. Please log in with Google.',
        );
      }

      // If a password exists, validate it
      if (user.password) {
        const isPasswordValid = this.cryptoService.verifyPassword(
          pass,
          user.password,
          user.salt,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException(MESSAGES.UNAUTHORIZED_ACCESS);
        }
      }

      // Generate JWT token
      const payload = { userId: user.id, username: user.username };
      const accessToken = await this.jwtService.signAsync(payload);

      const isRefreshTokenEnabled =
        this.configService.get<string>('ISREFRESH_TOKEN');
      const refreshToken =
        isRefreshTokenEnabled === 'true'
          ? await this.jwtService.signAsync(payload, {
              expiresIn: this.configService.get<string>(
                'REFRESH_TOKEN_EXPIRES_IN',
              ),
            })
          : null;

      return refreshToken ? { accessToken, refreshToken } : { accessToken };
    } catch (err) {
      throw err;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      console.log(payload);
      const newPayload = { userId: payload.userId, username: payload.username };

      const accessToken = await this.jwtService.signAsync(newPayload);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(MESSAGES.INVALID_TOKEN);
    }
  }
  async createUser(createUserDto: CreateUserDto) {
    try {
      const { hash: hashedPassword, salt } = this.cryptoService.hashPassword(
        createUserDto.password,
      );

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        salt: salt,
      });

      const createdUser = await this.userRepository.save(user);

      const newUser = {
        username: createdUser.username,
        pass: createdUser.password,
      };
      // Directly access the created user's properties
      const signInRes = await this.signIn(newUser.username, newUser.pass);

      return signInRes;
    } catch (err) {
      throw err;
    }
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    const { email, password } = setPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.password) {
      throw new Error('Password is already set. Use forgot password to reset.');
    }

    const { hash, salt } = this.cryptoService.hashPassword(password);

    user.password = hash;
    user.salt = salt;
    await this.userRepository.save(user);

    return {
      message:
        'Password set successfully. You can now log in with email/password.',
    };
  }
}
