import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SendMailRequest } from 'app-common/send-mail-request.dto';
import { SendMailEvent } from 'app-common/send-mail.events';
import axios from 'axios';
const fs = require('fs').promises;
const path = require('path');

@Injectable()
export class AppService {
  constructor(
    @Inject('MAIL_SERVICE') private readonly mailClient: ClientKafka,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  sendMail({ email, content }: SendMailRequest) {
    this.mailClient.emit('send_mail', new SendMailEvent(email, content));
  }

  // async getInvoiceEmails(accessToken: string) {
  //   try {
  //     // Fetch all emails containing "invoice"
  //     const { data } = await axios.get(
  //       'https://www.googleapis.com/gmail/v1/users/me/messages?q=invoice',
  //       {
  //         headers: { Authorization: `Bearer ${accessToken}` },
  //       },
  //     );

  //     if (!data.messages) return { message: 'No invoices found.' };

  //     // Get details of each email
  //     const emails = await Promise.all(
  //       data.messages.map(async (msg) => {
  //         const response = await axios.get(
  //           `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
  //           { headers: { Authorization: `Bearer ${accessToken}` } },
  //         );
  //         return response.data;
  //       }),
  //     );

  //     return emails;
  //   } catch (error) {
  //     console.error('Error fetching emails:', error || error);
  //     return { error: 'Failed to fetch emails' };
  //   }
  // }

  async downloadAttachment(accessToken, messageId, attachmentId, filename) {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!response.data || !response.data.data) {
        throw new Error('Attachment data not found');
      }

      // Decode Base64 URL-safe string
      const fileBuffer = Buffer.from(response.data.data, 'base64');

      // Ensure downloads directory exists
      const filePath = path.join(__dirname, 'downloads', filename);
      if (!fs.existsSync(path.dirname(filePath))) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      // Save file locally (async version)
      await fs.writeFile(filePath, fileBuffer);

      console.log(`✅ Attachment downloaded: ${filename}`);
      return filePath;
    } catch (error) {
      console.error(
        `❌ Error downloading attachment ${filename} for message ${messageId}:`,
        error,
      );
      return null;
    }
  }

  // async getInvoiceEmails(accessToken: string) {
  //   try {
  //     // Step 1: Fetch all emails containing "invoice"
  //     const { data } = await axios.get(
  //       'https://www.googleapis.com/gmail/v1/users/me/messages?q=invoice',
  //       {
  //         headers: { Authorization: `Bearer ${accessToken}` },
  //       },
  //     );

  //     if (!data.messages) return { message: 'No invoices found.' };

  //     // Step 2: Get details of each email
  //     const emails = await Promise.all(
  //       data.messages.map(async (msg) => {
  //         const response = await axios.get(
  //           `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
  //           { headers: { Authorization: `Bearer ${accessToken}` } },
  //         );

  //         const emailData = response.data;
  //         const payload = emailData.payload;

  //         // Extract subject
  //         const subjectHeader = payload.headers.find(
  //           (header) => header.name === 'Subject',
  //         );
  //         const subject = subjectHeader ? subjectHeader.value : '(No Subject)';

  //         // Extract sender (From)
  //         const fromHeader = payload.headers.find(
  //           (header) => header.name === 'From',
  //         );
  //         const from = fromHeader ? fromHeader.value : 'Unknown Sender';

  //         // Extract message body
  //         let messageBody = '';

  //         if (payload.parts) {
  //           // Extract text or HTML
  //           const textPart = payload.parts.find(
  //             (part) => part.mimeType === 'text/plain',
  //           );
  //           const htmlPart = payload.parts.find(
  //             (part) => part.mimeType === 'text/html',
  //           );

  //           messageBody = textPart?.body?.data || htmlPart?.body?.data || '';
  //         } else {
  //           messageBody = payload.body?.data || '';
  //         }

  //         // Decode Base64 email body
  //         if (messageBody) {
  //           messageBody = Buffer.from(messageBody, 'base64').toString('utf-8');
  //         }

  //         // Extract attachments
  //         const attachments = [];

  //         if (payload.parts) {
  //           payload.parts.forEach((part) => {
  //             if (part.filename && part.body?.attachmentId) {
  //               attachments.push({
  //                 filename: part.filename,
  //                 attachmentId: part.body.attachmentId,
  //                 mimeType: part.mimeType,
  //               });
  //             }
  //           });
  //         }

  //         return { subject, from, messageBody, attachments };
  //       }),
  //     );

  //     return emails;
  //   } catch (error) {
  //     console.error('Error fetching emails:', error);
  //     return { error: 'Failed to fetch emails' };
  //   }
  // }
  async getInvoiceEmails(accessToken: string) {
    try {
      // Step 1: Fetch all emails containing "invoice"
      const { data } = await axios.get(
        'https://www.googleapis.com/gmail/v1/users/me/messages?q=invoice',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!data.messages) return { message: 'No invoices found.' };

      // Step 2: Get details of each email
      const emails = await Promise.all(
        data.messages.map(async (msg) => {
          const response = await axios.get(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          const emailData = response.data;
          const payload = emailData.payload;

          // Extract subject
          const subjectHeader = payload.headers.find(
            (header) => header.name === 'Subject',
          );
          const subject = subjectHeader ? subjectHeader.value : '(No Subject)';

          // Extract sender (From)
          const fromHeader = payload.headers.find(
            (header) => header.name === 'From',
          );
          const from = fromHeader ? fromHeader.value : 'Unknown Sender';

          // Extract message body
          let messageBody = '';

          if (payload.parts) {
            // Extract text or HTML
            const textPart = payload.parts.find(
              (part) => part.mimeType === 'text/plain',
            );
            const htmlPart = payload.parts.find(
              (part) => part.mimeType === 'text/html',
            );

            messageBody = textPart?.body?.data || htmlPart?.body?.data || '';
          } else {
            messageBody = payload.body?.data || '';
          }

          // Decode Base64 email body
          if (messageBody) {
            messageBody = Buffer.from(messageBody, 'base64').toString('utf-8');
          }

          // Extract attachments and download them
          const attachments = [];

          if (payload.parts) {
            for (const part of payload.parts) {
              if (part.filename && part.body?.attachmentId) {
                const attachment = {
                  filename: part.filename,
                  attachmentId: part.body.attachmentId,
                  mimeType: part.mimeType,
                };

                // Call downloadAttachment() here
                const filePath = await this.downloadAttachment(
                  accessToken,
                  msg.id, // messageId
                  attachment.attachmentId,
                  attachment.filename,
                );

                if (filePath) {
                  attachment['filePath'] = filePath; // Store downloaded file path
                }

                attachments.push(attachment);
              }
            }
          }

          return { subject, from, messageBody, attachments };
        }),
      );

      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      return { error: 'Failed to fetch emails' };
    }
  }

  async getYahooAccessToken(code: string): Promise<string> {
    const clientId = 'YOUR_YAHOO_CLIENT_ID';
    const clientSecret = 'YOUR_YAHOO_CLIENT_SECRET';
    const redirectUri = 'http://localhost:3000/yahoo/callback';

    const response = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
          grant_type: 'authorization_code',
        },
      },
    );

    return response.data.access_token;
  }

  // Fetch emails from Yahoo using the access token
  async getInvoiceEmailsYahoo(accessToken: string) {
    try {
      const response = await axios.get(
        'https://api.mail.yahoo.com/ws/mail/v1.1/jsonrpc',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            method: 'Mail.search',
            params: {
              query: 'invoice',
              folder: 'inbox',
              limit: 20,
            },
          },
        },
      );

      const emails = response.data.result.messages;
      if (!emails || emails.length === 0)
        return { message: 'No invoices found.' };

      // Process emails similar to Gmail
      const emailDetails = emails.map((email) => ({
        subject: email.subject || '(No Subject)',
        from: email.from?.address || 'Unknown Sender',
        messageBody: email.snippet || 'No message content available',
        attachments: email.attachment
          ? email.attachment.map((attachment) => ({
              filename: attachment.filename,
              attachmentId: attachment.attachmentId,
              mimeType: attachment.mimeType,
            }))
          : [],
      }));

      return emailDetails;
    } catch (error) {
      console.error('Error fetching emails from Yahoo:', error);
      return { error: 'Failed to fetch emails' };
    }
  }
}
