import type { HttpContext } from '@adonisjs/core/http'
import Waiter from '#models/waiter'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'

export default class OperationalWaitersController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const waiters = await Waiter.query()
      .where('restaurantId', tenant.restaurantId)
      .where('isActive', true)
      .orderBy('name', 'asc')

    return ok(
      response,
      waiters.map((w) => ({ id: w.id, name: w.name }))
    )
  }
}
