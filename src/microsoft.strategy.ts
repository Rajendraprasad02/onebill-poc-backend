import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'outlook') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientID: configService.get('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
      callbackURL:
        'https://onebill-poc-backend-production.up.railway.app/api/outlook/callback',
      scope: [
        'openid',
        'profile',
        'email',
        'Mail.Read',
        'User.Read',
        'offline_access',
      ],
      responseType: 'code',
      tenant: 'common',
      prompt: 'consent', // Forces Microsoft to ask for permissions every time
    });
  }

  async validate(accessToken, refreshToken, profile) {
    console.log('🔑 Access Token:', accessToken);
    console.log(
      '🔄 Refresh Token:',
      refreshToken || '⚠ NO REFRESH TOKEN RECEIVED',
    );
    console.log('👤 Profile:', JSON.stringify(profile, null, 2));
    if (!accessToken) {
      throw new UnauthorizedException(
        'Access Token not received from Microsoft',
      );
    }

    return {
      accessToken,
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
      },
    };
  }
}
