import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

const DATABASE_POOL = 'DATABASE_POOL';

const databasePoolFactory = {
  provide: DATABASE_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Pool({
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT') || 5432,
      database: configService.get('DB_NAME'),
      user: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  },
};

@Global()
@Module({
  providers: [databasePoolFactory],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}

export { DATABASE_POOL };
