import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((prop: string | undefined, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user as Record<string, unknown>;
  if (prop && user) return user[prop];
  return user;
});
