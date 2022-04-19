import { Catch, ExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';
import { TcpException } from 'src/exeptions/tcp.exeption';

@Catch(TcpException)
export class TcpExceptionFilter implements ExceptionFilter {
  catch(exception: TcpException) {
    return throwError(() => ({
      status: 'error',
      fields: exception.errors,
      remoteHost: exception.host,
      remotePort: exception.port,
    }));
  }
}
