import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'outlook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
      callbackURL:
        'https://onebill-poc-backend-production.up.railway.app/api/outlook/callback',
      scope: ['openid', 'profile', 'email', 'Mail.Read'],
      tenant: 'common',
    });
  }

  async validate(accessToken, refreshToken, profile) {
    console.log('accessToken', accessToken);
    console.log('profile', profile);

    return { accessToken, profile };
  }
}
