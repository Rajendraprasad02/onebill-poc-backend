import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import * as fs from 'fs';
import * as path from 'path';
import { AuthGuard } from './common/guards/auth.guards';
import { getDataFromJsonFile } from './common/utils/fileUtils';
import { SharedModule } from './common/modules/shared.module';
import { dataSourceOptions } from './db/dataSource/typeorm.module';
import { RoleModule } from 'modules/RBAC/role/role.module';
import { ActionsModule } from './modules/RBAC/actions/actions.module';
import { MenuCreatorModule } from './modules/RBAC/menu-creator/menu-creator.module';
import { MenuModulesModule } from './modules/RBAC/menu-creator/menu-modules.module';
import { MenuScreensModule } from './modules/RBAC/menu-creator/menu-screens.module';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from 'common/logging/logging.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from 'common/tasks/tasks.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'google.statergy';
import { GmailModule } from './modules/gmail/gmail.module';
import { YahooStrategy } from 'yahoo.strategy';
import { MicrosoftStrategy } from 'microsoft.strategy';

const environment = process.env.NODE_ENV || 'local'; // Default to 'local' if NODE_ENV is not set
// const configPath = path.resolve(__dirname, '../src/config/config.json'); // Path to your config file
// const config = getDataFromJsonFile(configPath);
// const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    PassportModule.register({ defaultStrategy: 'yahoo' }),
    PassportModule.register({ defaultStrategy: 'outlook' }),

    // ClientsModule.register([
    //   {
    //     name: 'MAIL_SERVICE',
    //     // transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         clientId: 'mail',
    //         brokers: ['localhost:9092'],
    //       },
    //       consumer: {
    //         groupId: 'mail-service',
    //       },
    //     },
    //   },
    // ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public'), // Serve images statically
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UserModule,
    AuthModule,
    SharedModule,
    RoleModule,
    ActionsModule,
    MenuCreatorModule,
    MenuModulesModule,
    MenuScreensModule,
    LoggingModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SharedModule,
    GmailModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    GoogleStrategy,
    YahooStrategy,
    MicrosoftStrategy,
  ],
})
export class AppModule {
  onModuleInit() {
    const publicDir = path.join(__dirname, '..', 'public');

    // Check if the public directory exists, if not, create it
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log(`Public directory created at: ${publicDir}`);
    }
  }
}
