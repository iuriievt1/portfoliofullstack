import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type CurrentUserPayload = {
  sub: string;
  roles: string[];
  sessionId: string;
};

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
