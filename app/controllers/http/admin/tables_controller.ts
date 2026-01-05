import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import { createTableValidator, updateTableValidator } from '#validators/admin_tables_validators'

export default class AdminTablesController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const tables = await Table.query()
      .where('restaurantId', tenant.restaurantId)
      .orderBy('name', 'asc')

    return ok(
      response,
      tables.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        isActive: t.isActive,
      }))
    )
  }

  public async store({ request, response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(createTableValidator)

    const table = await Table.create({
      restaurantId: tenant.restaurantId,
      name: payload.name,
      description: payload.description ?? null,
      isActive: payload.isActive ?? true,
    })

    return ok(response, { id: table.id }, 201)
  }

  public async show({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const table = await Table.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!table) throw new AppError('NOT_FOUND', 'Table not found', 404)

    return ok(response, {
      id: table.id,
      name: table.name,
      description: table.description,
      isActive: table.isActive,
    })
  }

  public async update({ request, response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(updateTableValidator)

    const table = await Table.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!table) throw new AppError('NOT_FOUND', 'Table not found', 404)

    if (payload.name !== undefined) table.name = payload.name
    if (payload.description !== undefined) table.description = payload.description ?? null
    if (payload.isActive !== undefined) table.isActive = payload.isActive

    await table.save()
    return ok(response, { id: table.id })
  }

  public async destroy({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const table = await Table.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!table) throw new AppError('NOT_FOUND', 'Table not found', 404)

    table.isActive = false
    await table.save()

    return ok(response, { id: table.id, deactivated: true })
  }
}
