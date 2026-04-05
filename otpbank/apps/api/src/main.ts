import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./modules/common/filters/all-exceptions.filter";
import { correlationIdMiddleware } from "./modules/common/middleware/correlation-id.middleware";
import { EnvService } from "./modules/config/env.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger("Bootstrap");
  const env = app.get(EnvService);

  if (env.trustProxy) {
    app.getHttpAdapter().getInstance().set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(cookieParser());
  app.use(correlationIdMiddleware);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({ origin: env.corsOrigins, credentials: true });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("OTPBank API")
    .setDescription("Bank-grade digital banking platform API")
    .setVersion("1.0.0")
    .addCookieAuth("otpbank_at")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(env.apiPort);
  logger.log(`OTPBank API listening on http://localhost:${env.apiPort}`);
}

bootstrap();
