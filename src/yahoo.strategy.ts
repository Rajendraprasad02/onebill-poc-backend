import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class YahooStrategy extends PassportStrategy(Strategy, 'yahoo') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://api.login.yahoo.com/oauth2/request_auth',
      tokenURL: 'https://api.login.yahoo.com/oauth2/get_token',
      clientID: configService.get<string>('YAHOO_CLIENT_ID'),
      clientSecret: configService.get<string>('YAHOO_APP_ID'),
      callbackURL:
        'https://onebill-poc-backend-production.up.railway.app/api/yahoo/callback', // Replace with your callback URL
      scope: ['openid', 'email', 'profile', 'mail.r'],
    });
  }

  // async validate(
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: any,
  //   done: Function,
  // ) {
  //   if (!accessToken) {
  //     return done(new UnauthorizedException(), false);
  //   }

  //   return done(null, {
  //     accessToken,
  //     profile,
  //   });
  // }
  async validate(accessToken: string): Promise<any> {
    const { data } = await axios.get(
      'https://api.login.yahoo.com/openid/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return { email: data.email, name: data.name };
  }
}
