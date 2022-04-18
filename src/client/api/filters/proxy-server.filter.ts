import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ProxyServerNotAnswerException } from '../exeptions/proxy-server.exeption';

@Catch(ProxyServerNotAnswerException)
export class ProxyServerNotAnswerExceptionFilter implements ExceptionFilter {
  catch(exception: ProxyServerNotAnswerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      address: exception.address,
    });
  }
}
