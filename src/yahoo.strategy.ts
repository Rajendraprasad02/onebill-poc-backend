import { Strategy } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

@Injectable()
export class YahooStrategy extends PassportStrategy(Strategy, 'yahoo') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>(process.env.YOHOO_CLIENT_ID),
      clientSecret: configService.get<string>(process.env.YAHOO_APP_ID),
      callbackURL:
        'https://f7a0-2409-4091-a0a3-d200-f464-64e0-4b9b-8cf0.ngrok-free.app',
      scope: ['mail-r'], // Add other scopes as needed
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
