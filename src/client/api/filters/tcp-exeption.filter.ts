import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TcpExceptionClient } from '../../../exeptions/tcp.exeption';

@Catch(TcpExceptionClient)
export class TcpExceptionFilter implements ExceptionFilter {
  catch(exception: TcpExceptionClient, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      servicePort: exception.port,
      serviceHost: exception.host,
      serviceResponse: {
        ...exception.errors,
      },
    });
  }
}
