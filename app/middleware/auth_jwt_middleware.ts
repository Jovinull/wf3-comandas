import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AppError from '#exceptions/app_error'
import { verifyJwt } from '#utils/jwt'

export default class AuthJwtMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const header = ctx.request.header('authorization') || ''
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null

    if (!token) {
      throw new AppError('UNAUTHORIZED', 'Missing Bearer token', 401)
    }

    let payload: ReturnType<typeof verifyJwt>
    try {
      payload = verifyJwt(token)
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid token', 401)
    }

    const user = await User.query().where('id', payload.sub).preload('restaurant').first()

    if (!user) throw new AppError('UNAUTHORIZED', 'Invalid token', 401)

    // Proteção extra: não confiar só no token
    if (user.restaurantId !== payload.restaurantId || user.role !== payload.role) {
      throw new AppError('UNAUTHORIZED', 'Invalid token claims', 401)
    }

    ctx.authUser = user
    await next()
  }
}
