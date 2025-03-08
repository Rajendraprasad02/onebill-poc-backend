import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config(); // Load environment variables
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/api/google/callback',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    console.log('Access Token:', accessToken); // Check if the token is retrieved
    console.log('Profile:', profile);

    if (!accessToken) {
      return done(new UnauthorizedException(), false);
    }

    return done(null, {
      accessToken,
      profile,
    });
  }
}
