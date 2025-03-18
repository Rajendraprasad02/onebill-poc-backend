import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config(); // Load environment variables

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),

      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        'https://onebill-poc-backend-production.up.railway.app/api/google/callback',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      accessType: 'offline', // Required to get a refresh token
      prompt: 'consent', // Ensures refresh token is returned
      includeGrantedScopes: true, // Add this

      session: false, // Debugging step
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    if (!accessToken) {
      return done(new UnauthorizedException(), false);
    }

    console.log('accessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    console.log('profile:', JSON.stringify(profile, null, 2));

    return done(null, {
      accessToken,
      profile,
      refreshToken,
    });
  }
}
