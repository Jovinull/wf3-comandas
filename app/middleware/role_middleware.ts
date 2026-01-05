import type { HttpContext } from '@adonisjs/core/http'
import AppError from '#exceptions/app_error'
import { UserRole } from '#utils/enums'

export default class RoleMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>, ...args: string[]) {
    if (!ctx.authUser) throw new AppError('UNAUTHORIZED', 'Not authenticated', 401)

    const allowed = args
      .flatMap((a) => String(a).split(','))
      .map((s) => s.trim())
      .filter(Boolean) as UserRole[]

    if (allowed.length === 0) return next()

    if (!allowed.includes(ctx.authUser.role)) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions', 403)
    }

    await next()
  }
}
