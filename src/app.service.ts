import { promises } from 'dns';
import { Inject, Injectable } from '@nestjs/common';

import { SendMailRequest } from 'app-common/send-mail-request.dto';
import { SendMailEvent } from 'app-common/send-mail.events';
const Imap = require('imap-simple');
import { simpleParser } from 'mailparser';
import axios from 'axios';

const fs = require('fs').promises;
const path = require('path').promises;

@Injectable()
export class AppService {
  constructor() {}
  getHello(): string {
    return 'Hello World!';
  }

  // sendMail({ email, content }: SendMailRequest) {
  //   this.mailClient.emit('send_mail', new SendMailEvent(email, content));
  // }

  async downloadAttachment(
    accessToken,
    messageId,
    attachmentId,
    filename,
    mimeType,
  ) {
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

      // Check if fileBuffer is non-empty
      if (fileBuffer.length === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Default to the MIME type to determine the file extension
      let extension = '';
      if (mimeType.includes('spreadsheetml.sheet')) {
        extension = '.xlsx';
      } else if (mimeType.includes('pdf')) {
        extension = '.pdf';
      } else if (mimeType.includes('image')) {
        extension = '.jpg'; // or other image type based on mimeType
      } else {
        extension = '.bin'; // Use a default extension if unknown
      }

      // Ensure downloads directory exists
      const filePath = path.join(
        __dirname,
        'downloads',
        `${filename}${extension}`,
      );
      if (!fs.existsSync(path.dirname(filePath))) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      }

      // Save file locally (async version)
      await fs.writeFile(filePath, fileBuffer);

      console.log(`✅ Attachment downloaded: ${filename}${extension}`);
      return filePath;
    } catch (error) {
      console.error(
        `❌ Error downloading attachment ${filename} for message ${messageId}:`,
        error,
      );
      return null;
    }
  }

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
            const attachmentPart = payload.parts.find(
              (part) => part.mimeType === 'multipart/alternative',
            );

            messageBody =
              textPart?.body?.data ||
              htmlPart?.body?.data ||
              attachmentPart?.body?.data ||
              '';
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
                  attachment.mimeType, // Pass mimeType correctly
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

  async getUserInfo(accessToken: string) {
    try {
      // Fetch user details from Google API
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return {
        name: data.name,
        email: data.email,
        profilePicture: data.picture,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { error: 'Failed to fetch user data' };
    }
  }

  async getDashboardData(accessToken: string) {
    try {
      // Fetch user info
      const userInfo = await this.getUserInfo(accessToken);

      // Fetch invoices (emails containing 'invoice')
      const emails = await this.getInvoiceEmails(accessToken);

      return {
        userInfo,
        emails,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { error: 'Failed to fetch dashboard data' };
    }
  }

  async getYahooInvoiceEmails(accessToken: string) {
    try {
      // Corrected Yahoo Mail API endpoint
      const { data } = await axios.get(
        'https://mail.yahooapis.com/v1.0/me/messages',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          // params: {
          //   q: 'invoice', // Search for emails with "invoice" in the subject
          //   maxResults: 10,
          // },
        },
      );

      if (!data.messages || data.messages.length === 0) {
        return { message: 'No invoices found.' };
      }

      // Step 2: Extract email details
      const emails = await Promise.all(
        data.messages.map(async (msg) => {
          const response = await axios.get(
            `https://mail.yahooapis.com/v1.0/me/messages/${msg.id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );

          const emailData = response.data;
          const headers = emailData.payload.headers;

          const subject =
            headers.find((header) => header.name === 'Subject')?.value ||
            '(No Subject)';

          const from =
            headers.find((header) => header.name === 'From')?.value ||
            'Unknown Sender';

          let messageBody = emailData.payload.body?.data || 'No content';
          if (messageBody) {
            messageBody = Buffer.from(messageBody, 'base64').toString('utf-8');
          }

          return { subject, from, messageBody };
        }),
      );

      return emails;
    } catch (error) {
      console.error('Error fetching Yahoo emails:', error);
      return { error: 'Failed to fetch emails from Yahoo' };
    }
  }

  async fetchYahooInbox(userEmail, accessToken) {
    const config = {
      imap: {
        user: userEmail, // User's Yahoo email
        xoauth2: accessToken, // OAuth token instead of password
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true,
        authTimeout: 30000,
      },
    };

    try {
      const connection = await Imap.connect(config);
      await connection.openBox('INBOX');

      const searchCriteria = ['UNSEEN']; // Fetch unread emails
      const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`Unread Emails for ${userEmail}:`, messages.length);

      messages.forEach((message) => {
        const header = message.parts.find(
          (part) => part.which === 'HEADER',
        ).body;
        console.log('From:', header.from[0]);
        console.log('Subject:', header.subject[0]);
      });

      connection.end();
    } catch (error) {
      console.error(`IMAP Error for ${userEmail}:`, error);
    }
  }
}
