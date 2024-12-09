import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3004', // El origen de tu frontend
      '*', // o cualquier otro origen
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'SOAPAction'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
