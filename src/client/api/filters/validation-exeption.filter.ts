import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationExceptionClient } from '../../../exeptions/validation.exeption';

@Catch(ValidationExceptionClient)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationExceptionClient, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      fields: {
        ...exception.errors,
      },
    });
  }
}
