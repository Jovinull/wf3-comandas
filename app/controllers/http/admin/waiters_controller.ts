import type { HttpContext } from '@adonisjs/core/http'
import Waiter from '#models/waiter'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import { createWaiterValidator, updateWaiterValidator } from '#validators/admin_waiters_validators'

export default class AdminWaitersController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const waiters = await Waiter.query()
      .where('restaurantId', tenant.restaurantId)
      .orderBy('name', 'asc')

    return ok(
      response,
      waiters.map((w) => ({ id: w.id, name: w.name, isActive: w.isActive, createdAt: w.createdAt }))
    )
  }

  public async store({ request, response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(createWaiterValidator)

    const waiter = await Waiter.create({
      restaurantId: tenant.restaurantId,
      name: payload.name,
      isActive: payload.isActive ?? true,
    })

    return ok(response, { id: waiter.id }, 201)
  }

  public async show({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const waiter = await Waiter.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!waiter) throw new AppError('NOT_FOUND', 'Waiter not found', 404)

    return ok(response, { id: waiter.id, name: waiter.name, isActive: waiter.isActive })
  }

  public async update({ request, response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(updateWaiterValidator)

    const waiter = await Waiter.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!waiter) throw new AppError('NOT_FOUND', 'Waiter not found', 404)

    if (payload.name !== undefined) waiter.name = payload.name
    if (payload.isActive !== undefined) waiter.isActive = payload.isActive

    await waiter.save()
    return ok(response, { id: waiter.id })
  }

  public async destroy({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    // delete “seguro”: desativa para manter histórico
    const waiter = await Waiter.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!waiter) throw new AppError('NOT_FOUND', 'Waiter not found', 404)

    waiter.isActive = false
    await waiter.save()

    return ok(response, { id: waiter.id, deactivated: true })
  }
}
