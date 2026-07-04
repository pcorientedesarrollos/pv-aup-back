import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : '';

    const logMessage = `[${new Date().toISOString()}] ${request.method} ${request.url}\nStatus: ${status}\nMessage: ${message}\nStack: ${stack}\nBody: ${JSON.stringify(request.body)}\n---------------------------\n`;
    
    // Log to file
    const logPath = path.join(process.cwd(), 'error.log');
    fs.appendFileSync(logPath, logMessage);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
