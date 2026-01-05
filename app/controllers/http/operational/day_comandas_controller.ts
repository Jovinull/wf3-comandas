import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'

export default class DayComandasController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    const start = DateTime.now().startOf('day').toSQL()
    const end = DateTime.now().endOf('day').toSQL()

    const rows = await db
      .from('comandas')
      .join('tables', 'tables.id', 'comandas.table_id')
      .leftJoin('orders', 'orders.comanda_id', 'comandas.id')
      .leftJoin('order_items', 'order_items.order_id', 'orders.id')
      .where('comandas.restaurant_id', tenant.restaurantId)
      .andWhere((q) => {
        q.whereBetween('comandas.opened_at', [start, end]).orWhereBetween('comandas.closed_at', [
          start,
          end,
        ])
      })
      .select(
        'comandas.id as comandaId',
        'comandas.status as status',
        'comandas.opened_at as openedAt',
        'comandas.closed_at as closedAt',
        'comandas.total_amount as totalAmount',
        'tables.id as tableId',
        'tables.name as tableName'
      )
      .sum({ partialTotal: 'order_items.subtotal' })
      .groupBy(
        'comandas.id',
        'comandas.status',
        'comandas.opened_at',
        'comandas.closed_at',
        'comandas.total_amount',
        'tables.id',
        'tables.name'
      )
      .orderBy('comandas.opened_at', 'desc')

    return ok(
      response,
      rows.map((r: any) => ({
        id: r.comandaId,
        status: r.status,
        openedAt: r.openedAt,
        closedAt: r.closedAt,
        table: { id: r.tableId, name: r.tableName },
        total: r.totalAmount
          ? Number(r.totalAmount).toFixed(2)
          : Number(r.partialTotal ?? 0).toFixed(2),
      }))
    )
  }
}
