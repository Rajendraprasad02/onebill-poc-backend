import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import generatePKCEChallenge from 'pkce-challenge'; // ✅ Correct Import

@Injectable()
export class YahooStrategy extends PassportStrategy(Strategy, 'yahoo') {
  private static codeVerifier: string;
  private static codeChallenge: string;

  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://api.login.yahoo.com/oauth2/request_auth',
      tokenURL: 'https://api.login.yahoo.com/oauth2/get_token',
      clientID: configService.get<string>('YAHOO_CLIENT_ID'),
      clientSecret: configService.get<string>('YAHOO_APP_ID'),
      callbackURL:
        'https://onebill-poc-backend-production.up.railway.app/api/yahoo/callback',
      scope: ['openid', 'email', 'profile', 'mail-r'],
    });

    // Generate PKCE challenge asynchronously
    this.generatePKCE();
  }

  private async generatePKCE() {
    const pkce = await generatePKCEChallenge(); // ✅ Await the promise
    YahooStrategy.codeVerifier = pkce.code_verifier;
    YahooStrategy.codeChallenge = pkce.code_challenge;

    console.log('✅ Generated PKCE Code Verifier:', YahooStrategy.codeVerifier);
    console.log(
      '✅ Generated PKCE Code Challenge:',
      YahooStrategy.codeChallenge,
    );
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    if (!accessToken) {
      console.error('Yahoo OAuth Error: No access token received');
      return done(new UnauthorizedException(), false);
    }

    console.log('✅ Access Token:', accessToken);
    console.log('✅ Profile:', profile);

    return done(null, { accessToken, profile });
  }
}
