import type { HttpContext } from '@adonisjs/core/http'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'
import ComandaService from '#services/comanda_service'

export default class ComandasController {
  public async show({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const service = new ComandaService()
    const data = await service.getComandaDetail(tenant.restaurantId, params.id)

    // Serialize “limpo” pro front
    return ok(response, {
      comanda: {
        id: data.comanda.id,
        status: data.comanda.status,
        openedAt: data.comanda.openedAt,
        closedAt: data.comanda.closedAt,
        totalAmount: data.comanda.totalAmount,
        table: data.comanda.table
          ? { id: data.comanda.table.id, name: data.comanda.table.name }
          : null,
      },
      orders: data.orders.map((o) => ({
        id: o.id,
        note: o.note,
        createdAt: o.createdAt,
        operationalWaiter: o.operationalWaiter
          ? { id: o.operationalWaiter.id, name: o.operationalWaiter.name }
          : null,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.product?.name ?? null,
          quantity: it.quantity,
          unitPriceSnapshot: it.unitPriceSnapshot,
          subtotal: it.subtotal,
        })),
      })),
    })
  }

  public async close({ response, tenant, params }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const service = new ComandaService()
    const result = await service.closeComanda(tenant.restaurantId, params.id)

    return ok(response, result)
  }
}
