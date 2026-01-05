import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import { loginValidator } from '#validators/auth_validators'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'
import { signJwt } from '#utils/jwt'

export default class AuthController {
  public async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)

    const user = await User.query().where('email', payload.email.toLowerCase()).first()
    if (!user || !user.isActive) throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401)

    const valid = await hash.verify(user.passwordHash, payload.password)
    if (!valid) throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401)

    const token = signJwt({
      sub: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
    })

    return ok(response, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    })
  }

  public async me({ response, authUser }: HttpContext) {
    if (!authUser) throw new AppError('UNAUTHORIZED', 'Not authenticated', 401)

    return ok(response, {
      user: {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        restaurantId: authUser.restaurantId,
        isActive: authUser.isActive,
      },
      restaurant: authUser.restaurant
        ? {
            id: authUser.restaurant.id,
            name: authUser.restaurant.name,
            slug: authUser.restaurant.slug,
          }
        : null,
    })
  }

  public async logout({ response }: HttpContext) {
    // JWT stateless: logout no backend não revoga token sem blacklist/refresh.
    return ok(response, { loggedOut: true })
  }
}
