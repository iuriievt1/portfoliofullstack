import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("/health")
  health() {
    return { ok: true, service: "otpbank-api" };
  }

  @Get("/ready")
  ready() {
    return { ready: true };
  }

  @Get("/live")
  live() {
    return { alive: true };
  }
}
