import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { CSRF_HEADER } from "../constants";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
    const expected = request.cookies?.otpbank_csrf;
    const provided = request.header(CSRF_HEADER);
    if (!expected || !provided || expected !== provided) {
      throw new ForbiddenException("CSRF validation failed");
    }
    return true;
  }
}
