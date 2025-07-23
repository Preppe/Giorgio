import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurazione CORS per il frontend
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Configurazione ValidationPipe globale
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Configurazione del prefisso globale per le API
  app.setGlobalPrefix('');

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
