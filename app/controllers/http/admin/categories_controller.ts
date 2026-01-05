import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import {
  createCategoryValidator,
  updateCategoryValidator,
} from '#validators/admin_categories_validators'

export default class AdminCategoriesController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const categories = await Category.query()
      .where('restaurantId', tenant.restaurantId)
      .orderByRaw('COALESCE(sort_order, 9999) asc')
      .orderBy('name', 'asc')

    return ok(
      response,
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
      }))
    )
  }

  public async store({ request, response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(createCategoryValidator)

    const category = await Category.create({
      restaurantId: tenant.restaurantId,
      name: payload.name,
      sortOrder: payload.sortOrder ?? null,
      isActive: payload.isActive ?? true,
    })

    return ok(response, { id: category.id }, 201)
  }

  public async show({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const category = await Category.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404)

    return ok(response, {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
  }

  public async update({ request, response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(updateCategoryValidator)

    const category = await Category.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404)

    if (payload.name !== undefined) category.name = payload.name
    if (payload.sortOrder !== undefined) category.sortOrder = payload.sortOrder ?? null
    if (payload.isActive !== undefined) category.isActive = payload.isActive

    await category.save()
    return ok(response, { id: category.id })
  }

  public async destroy({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const category = await Category.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!category) throw new AppError('NOT_FOUND', 'Category not found', 404)

    category.isActive = false
    await category.save()

    return ok(response, { id: category.id, deactivated: true })
  }
}
