import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RegisterService } from './client/register/register.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appPort = configService.get('HTTP_SERVICE_PORT');
  const microservicePort = configService.get('BLOCKCHAIN_SERVICE_PORT');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: microservicePort,
    },
  });

  await app.startAllMicroservices();

  await app.listen(appPort);

  const registerService = app.get(RegisterService);

  await registerService.registerNode();
}
bootstrap();
