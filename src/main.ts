import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appPort = configService.get('CLIENT_PORT');
  const microservicePort = configService.get('CLIENT_PORT');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: microservicePort,
    },
  });

  await app.startAllMicroservices();

  await app.listen(appPort);
}
bootstrap();
