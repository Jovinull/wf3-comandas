import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { ok } from '#utils/api_response'
import AppError from '#exceptions/app_error'
import { ComandaStatus } from '#utils/enums'

export default class OverviewController {
  public async index({ response, tenant }: HttpContext) {
    if (!tenant) throw new AppError('UNAUTHORIZED', 'No tenant', 401)

    // Query eficiente (sem N+1): tables + comanda open + soma parcial
    const rows = await db
      .from('tables')
      .leftJoin('comandas', function () {
        this.on('comandas.table_id', '=', 'tables.id')
          .andOn('comandas.restaurant_id', '=', 'tables.restaurant_id')
          .andOnVal('comandas.status', '=', ComandaStatus.OPEN)
      })
      .leftJoin('orders', function () {
        this.on('orders.comanda_id', '=', 'comandas.id').andOn(
          'orders.restaurant_id',
          '=',
          'tables.restaurant_id'
        )
      })
      .leftJoin('order_items', function () {
        this.on('order_items.order_id', '=', 'orders.id').andOn(
          'order_items.restaurant_id',
          '=',
          'tables.restaurant_id'
        )
      })
      .where('tables.restaurant_id', tenant.restaurantId)
      .where('tables.is_active', true)
      .select(
        'tables.id as tableId',
        'tables.name as tableName',
        'tables.description as tableDescription',
        'comandas.id as comandaId',
        'comandas.opened_at as openedAt',
        'comandas.status as comandaStatus'
      )
      .sum({ partialTotal: 'order_items.subtotal' })
      .groupBy(
        'tables.id',
        'tables.name',
        'tables.description',
        'comandas.id',
        'comandas.opened_at',
        'comandas.status'
      )
      .orderBy('tables.name', 'asc')

    return ok(
      response,
      rows.map((r: any) => ({
        table: {
          id: r.tableId,
          name: r.tableName,
          description: r.tableDescription,
        },
        comandaOpen: r.comandaId
          ? {
              id: r.comandaId,
              openedAt: r.openedAt,
              status: r.comandaStatus,
              partialTotal: Number(r.partialTotal ?? 0).toFixed(2),
            }
          : null,
      }))
    )
  }
}
