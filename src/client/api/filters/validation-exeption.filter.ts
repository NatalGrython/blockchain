import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationException } from '../../../exeptions/validation.exeption';

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
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
