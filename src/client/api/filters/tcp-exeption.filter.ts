import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationExceptionClient } from '../../../exeptions/validation.exeption';
import { TcpException } from '../../../exeptions/tcp.exeption';

@Catch(TcpException)
export class TcpExceptionFilter implements ExceptionFilter {
  catch(exception: TcpException, host: ArgumentsHost) {
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
