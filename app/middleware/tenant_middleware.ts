import type { HttpContext } from '@adonisjs/core/http'
import AppError from '#exceptions/app_error'

export default class TenantMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    if (!ctx.authUser) throw new AppError('UNAUTHORIZED', 'Not authenticated', 401)

    ctx.tenant = { restaurantId: ctx.authUser.restaurantId }
    await next()
  }
}
