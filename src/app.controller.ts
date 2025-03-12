import { InjectRepository } from '@nestjs/typeorm';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
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

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService, // ✅ Corrected
    private readonly userService: UserService, // ✅ Corrected

    private readonly appService: AppService,
    private readonly mailService: MailService,
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

    // const existingUser = await this.userService.findByEmail(email); // Check user in DB
    // const existingUser = false; // Check user in DB

    // if (existingUser) {
    // User already exists → Redirect to invoice page
    return res.redirect(
      `https://onebill-poc.vercel.app/#/invoice-emails?token=${token}`,
    );
    // } else {
    //   // User does not exist → Redirect to set password page
    //   return res.redirect(
    //     `https://onebill-poc.vercel.app/set-password?email=${email}&token=${token}`,
    //   );
    // }
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
      const { email, password } = body;
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

      // Step 2: Redirect to invoice page
      return res.status(201).json({
        message: 'User created successfully',
        redirectUrl: `https://onebill-poc.vercel.app/#/invoice-emails?token=${token}`,
      });
    } catch (error) {
      console.error('Error setting password:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Public()
  @Get('yahoo')
  @UseGuards(AuthGuard('yahoo'))
  async yahooAuth() {
    // Redirects to Yahoo login page
  }

  @Public()
  @Get('yahoo/callback')
  @UseGuards(AuthGuard('yahoo'))
  async yahooAuthRedirect(@Req() req, @Res() res) {
    const email = req.user.profile?.emails?.[0]?.value;

    const token = req.user.accessToken;

    return res.redirect(
      `https://onebill-poc.vercel.app/#/invoice-emails?token=${token}`,
    );
  }

  @Public()
  @Get('yahoo/emails')
  async getYahooEmails(@Req() req) {
    const token = req.query.token;
    return this.appService.getYahooInvoiceEmails(token);
  }

  @Public()
  @Post('ak')
  async getMail(@Body() body) {
    const { userEmail, accessToken } = body;

    return this.appService.fetchYahooInbox(userEmail, accessToken);
  }

  @Public()
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth() {}

  @Public()
  @Get('outlook/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthRedirect(@Req() req) {
    console.log('in the microsdo');
    console.log('in the microsdo', req);

    const accessToken = req.user.accessToken;
    const mails = await axios.get(
      'https://graph.microsoft.com/v1.0/me/messages',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return mails.data.value; // Return Outlook emails
  }
}
