import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables
  const REQUIRED = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
  REQUIRED.forEach(v => {
    if (!process.env[v]) {
      console.error(`Missing required environment variable: ${v}`);
      process.exit(1);
    }
  });

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api-m.paypal.com', 'https://api-m.sandbox.paypal.com'],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for PayPal SDK
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`FlashMovies API running on port ${port}`);
}
bootstrap();
