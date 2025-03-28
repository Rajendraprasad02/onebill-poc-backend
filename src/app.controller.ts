import { InjectRepository } from '@nestjs/typeorm';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from 'common/modules/services/mail.service';
import { Public } from 'common/decorators/public.decorator';
import { SendMailRequest } from 'app-common/send-mail-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'modules/auth/auth.service';
import { UserService } from 'modules/users/user/user.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CardDetailsService } from 'modules/card-details/card-details.service';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService, // ✅ Corrected
    private readonly userService: UserService, // ✅ Corrected

    private readonly appService: AppService,
    private readonly mailService: MailService,
    private readonly cardService: CardDetailsService,
    private configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
  // @Public()
  // @Post('mailcheck')
  // async asmailCheck(@Body() SendMailRequest): Promise<any> {
  //   console.log('SendMailRequest', SendMailRequest);
  //   this.appService.sendMail(SendMailRequest);

  // return await this.mailService.sendMail(
  //   'virumab6@gmail.com',
  //   'subject new',
  //   null,
  //   true,
  //   'welcome',
  //   {
  //     name: 'Viruma',
  //     platform: 'React',
  //   },
  // );
  // }
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google login page
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const email = req.user.profile?.emails?.[0]?.value;
    const token = req.user.accessToken;
    const refreshToken = req;

    // return res.redirect(
    //   `https://onebill-poc.vercel.app/#/invoice-emails?token=${token}&provider=google`,
    //   `https://onebill-poc.vercel.app/#/auth-redirect?token=${token}&provider=google`,
    // );

    const user = await this.userService.findByEmail(email);

    const isNewUser = user ? 'false' : 'true'; // Convert to string for URL params

    // Redirect based on user existence
    const redirectUrl = `https://onebill-poc.vercel.app/#/auth-redirect?token=${token}&provider=google&isNewUser=${isNewUser}&userid=${user?.id}`;

    return res.redirect(redirectUrl);
  }

  @Public()
  @Get('emails')
  async getEmails(@Req() req) {
    const token = req.query.token;
    return this.appService.getDashboardData(token);
  }

  @Public()
  @Post('google/set-password')
  async setGooglePassword(@Body() body, @Req() req, @Res() res) {
    try {
      const { email, password, cards, provider } = body; // Accept `cards` in the request body
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"

      if (!token) {
        return res
          .status(401)
          .json({ message: 'Unauthorized: No token provided' });
      }

      // Step 1: Create the user
      const newUser = await this.authService.createUser({
        email,
        username: email,
        password,
      });

      console.log('useruseruseruser', newUser);

      if (!newUser) {
        return res.status(500).json({ message: 'User creation failed' });
      }

      // Step 2: Add cards for the new user (if any)
      if (cards && cards.length > 0) {
        await this.cardService.addCards(newUser.id, cards);
      }

      // Step 2: Redirect to invoice page
      return res.status(201).json({
        user: newUser,
        message: 'User created successfully',
        redirectUrl: `https://onebill-poc.vercel.app/#/auth-redirect?token=${token}&provider=${provider}&isNewUser=false&userid=${newUser.id}`,
      });
    } catch (error) {
      console.error('Error setting password:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Public()
  @Post('ak')
  async getMail(@Body() body) {
    const { userEmail, accessToken } = body;

    return this.appService.fetchYahooInbox(userEmail, accessToken);
  }

  @Public()
  @Get('outlook')
  @UseGuards(AuthGuard('outlook'))
  async microsoftAuth() {}

  @Public()
  @Get('outlook/callback')
  async microsoftAuthRedirect(@Query('code') code: string, @Res() res) {
    if (!code) {
      throw new UnauthorizedException('Authorization code not received');
    }

    try {
      // Step 1: Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        new URLSearchParams({
          client_id: this.configService.get('MICROSOFT_CLIENT_ID'),
          client_secret: this.configService.get('MICROSOFT_CLIENT_SECRET'),
          code: code,
          redirect_uri:
            'https://onebill-poc-backend-production.up.railway.app/api/outlook/callback',
          grant_type: 'authorization_code',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new UnauthorizedException('Access token not received');
      }

      const userResponse = await axios.get(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const email =
        userResponse.data.mail || userResponse.data.userPrincipalName;

      if (!email) {
        throw new UnauthorizedException('Email not received from Microsoft');
      }

      const user = await this.userService.findByEmail(email);

      const isNewUser = user ? 'false' : 'true'; // Convert to string for URL params

      // const redirectUrl = `https://onebill-poc.vercel.app/#/invoice-emails?token=${access_token}&provider=outlook&isNewUser=${isNewUser}`;
      const redirectUrl = `https://onebill-poc.vercel.app/#/auth-redirect?token=${access_token}&provider=outlook&isNewUser=${isNewUser}&userid=${user?.id}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Microsoft OAuth Error:', error);
      throw new InternalServerErrorException(
        'Failed to authenticate with Microsoft',
      );
    }
  }
}
