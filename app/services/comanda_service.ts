import db from '@adonisjs/lucid/services/db'
import AppError from '#exceptions/app_error'
import Comanda from '#models/comanda'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import { ComandaStatus } from '#utils/enums'
import { DateTime } from 'luxon'

export default class ComandaService {
  public async closeComanda(restaurantId: string, comandaId: string) {
    return await db.transaction(async (trx) => {
      const comanda = await Comanda.query({ client: trx })
        .where('id', comandaId)
        .where('restaurantId', restaurantId)
        .forUpdate()
        .first()

      if (!comanda) throw new AppError('NOT_FOUND', 'Comanda not found', 404)
      if (comanda.status !== ComandaStatus.OPEN) {
        throw new AppError('CONFLICT', 'Comanda already closed', 409)
      }

      // soma itens da comanda
      const rows = await OrderItem.query({ client: trx })
        .join('orders', 'orders.id', 'order_items.order_id')
        .where('orders.comanda_id', comandaId)
        .where('order_items.restaurant_id', restaurantId)
        .sum({ total: 'order_items.subtotal' })

      const totalAmount = Number(rows[0]?.$extras?.total ?? 0).toFixed(2)

      comanda.status = ComandaStatus.CLOSED
      comanda.closedAt = DateTime.now()
      comanda.totalAmount = totalAmount

      await comanda.useTransaction(trx).save()

      return {
        id: comanda.id,
        status: comanda.status,
        openedAt: comanda.openedAt,
        closedAt: comanda.closedAt,
        totalAmount: comanda.totalAmount,
      }
    })
  }

  public async getComandaDetail(restaurantId: string, comandaId: string) {
    const comanda = await Comanda.query()
      .where('id', comandaId)
      .where('restaurantId', restaurantId)
      .preload('table')
      .first()

    if (!comanda) throw new AppError('NOT_FOUND', 'Comanda not found', 404)

    const orders = await Order.query()
      .where('restaurantId', restaurantId)
      .where('comandaId', comandaId)
      .preload('operationalWaiter')
      .preload('items', (q) => q.preload('product'))
      .orderBy('createdAt', 'asc')

    return { comanda, orders }
  }
}
