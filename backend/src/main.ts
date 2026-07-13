import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: '*', // For development flexibility; narrow down for production profiles
  });
  await app.listen(port);
  console.log(`NestJS Backend Agent server running `);
}
bootstrap();
