import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === "object" && exceptionResponse && "message" in exceptionResponse
        ? exceptionResponse.message
        : exception instanceof Error
          ? exception.message
          : "Internal server error";

    if (status >= 500) {
      this.logger.error(String(message), exception instanceof Error ? exception.stack : undefined);
    }

    response.status(status).json({
      success: false,
      error: { code: status, message, path: request.url },
      meta: { correlationId: request.correlationId }
    });
  }
}
