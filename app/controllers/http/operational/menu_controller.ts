import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'

export default class MenuController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const categories = await Category.query()
      .where('restaurantId', tenant.restaurantId)
      .where('isActive', true)
      .orderByRaw('COALESCE(sort_order, 9999) asc')
      .orderBy('name', 'asc')
      .preload('products', (q) => {
        q.where('restaurantId', tenant.restaurantId).where('isActive', true).orderBy('name', 'asc')
      })

    return ok(
      response,
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder,
        products: c.products.map((p) => ({
          id: p.id,
          categoryId: p.categoryId,
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
        })),
      }))
    )
  }
}
