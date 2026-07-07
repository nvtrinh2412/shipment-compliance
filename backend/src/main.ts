import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Safiri AI Shipment Compliance')
    .setDescription('The API for validating logistics shipment compliance')
    .setVersion('1.0')
    .addTag('shipments')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors(); // allow React frontend to connect

  await app.listen(appConfig.server.port);
}
bootstrap();
