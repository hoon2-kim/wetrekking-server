import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
// import { ValidationPipe } from '@nestjs/common';
import { graphqlUploadExpress } from 'graphql-upload';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  // app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://develop.wetrekking.kr',
      'https://wetrekking.kr',
      'http://localhost:5501',
      'http://localhost:5500',
    ],
    credentials: true,
  });
  app.use(graphqlUploadExpress());
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(3000);
}
bootstrap();
