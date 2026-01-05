import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import Category from '#models/category'
import AppError from '#exceptions/app_error'
import { ok } from '#utils/api_response'
import {
  createProductValidator,
  updateProductValidator,
} from '#validators/admin_products_validators'

export default class AdminProductsController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const products = await Product.query()
      .where('restaurantId', tenant.restaurantId)
      .orderBy('name', 'asc')

    return ok(
      response,
      products.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
      }))
    )
  }

  public async store({ request, response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(createProductValidator)

    const category = await Category.query()
      .where('id', payload.categoryId)
      .where('restaurantId', tenant.restaurantId)
      .where('isActive', true)
      .first()

    if (!category) throw new AppError('CONFLICT', 'Invalid categoryId', 409)

    const product = await Product.create({
      restaurantId: tenant.restaurantId,
      categoryId: payload.categoryId,
      name: payload.name,
      description: payload.description ?? null,
      price: payload.price.toFixed(2),
      imageUrl: payload.imageUrl ?? null,
      isActive: payload.isActive ?? true,
    })

    return ok(response, { id: product.id }, 201)
  }

  public async show({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const product = await Product.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404)

    return ok(response, {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
    })
  }

  public async update({ request, response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const payload = await request.validateUsing(updateProductValidator)

    const product = await Product.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404)

    if (payload.categoryId !== undefined) {
      const category = await Category.query()
        .where('id', payload.categoryId)
        .where('restaurantId', tenant.restaurantId)
        .where('isActive', true)
        .first()
      if (!category) throw new AppError('CONFLICT', 'Invalid categoryId', 409)
      product.categoryId = payload.categoryId
    }

    if (payload.name !== undefined) product.name = payload.name
    if (payload.description !== undefined) product.description = payload.description ?? null
    if (payload.price !== undefined) product.price = payload.price.toFixed(2)
    if (payload.imageUrl !== undefined) product.imageUrl = payload.imageUrl ?? null
    if (payload.isActive !== undefined) product.isActive = payload.isActive

    await product.save()
    return ok(response, { id: product.id })
  }

  public async destroy({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const product = await Product.query()
      .where('id', params.id)
      .where('restaurantId', tenant.restaurantId)
      .first()

    if (!product) throw new AppError('NOT_FOUND', 'Product not found', 404)

    product.isActive = false
    await product.save()

    return ok(response, { id: product.id, deactivated: true })
  }
}
