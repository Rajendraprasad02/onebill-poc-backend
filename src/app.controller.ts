import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from 'common/modules/services/mail.service';
import { Public } from 'common/decorators/public.decorator';
import { SendMailRequest } from 'app-common/send-mail-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
  @Public()
  @Post('mailcheck')
  async asmailCheck(@Body() SendMailRequest): Promise<any> {
    console.log('SendMailRequest', SendMailRequest);
    this.appService.sendMail(SendMailRequest);

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
  }
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
    const token = req.user.accessToken;
    return res.redirect(`http://localhost:5173/invoice-emails?token=${token}`);
  }
  @Public()
  @Get('emails')
  async getEmails(@Req() req) {
    const token = req.query.token;
    return this.appService.getInvoiceEmails(token);
  }
}
