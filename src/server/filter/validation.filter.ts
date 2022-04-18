import { Catch, ExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';
import { ValidationExceptionServer } from '../../exeptions/validation.exeption';

@Catch(ValidationExceptionServer)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationExceptionServer) {
    return throwError(() => ({ status: 'error', fields: exception.errors }));
  }
}
