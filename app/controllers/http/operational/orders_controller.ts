import type { HttpContext } from '@adonisjs/core/http'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'
import { createOrderValidator } from '#validators/operational_orders_validators'
import OrderService from '#services/order_service'

export default class OrdersController {
  public async store({ request, response, tenant, authUser, params }: HttpContext) {
    if (!tenant || !authUser) throw new AppError('UNAUTHORIZED', 'Not authenticated', 401)

    const payload = await request.validateUsing(createOrderValidator)

    const service = new OrderService()
    const result = await service.createOrderForTable({
      restaurantId: tenant.restaurantId,
      tableId: params.tableId,
      operationalWaiterId: payload.operationalWaiterId,
      createdByUserId: authUser.id,
      note: payload.note,
      items: payload.items,
    })

    return ok(response, result, 201)
  }
}
