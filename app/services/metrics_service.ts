import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ComandaStatus } from '#utils/enums'

function parseRange(from?: string, to?: string) {
  const now = DateTime.now()
  const start = from ? DateTime.fromISO(from).startOf('day') : now.minus({ days: 6 }).startOf('day')
  const end = to ? DateTime.fromISO(to).endOf('day') : now.endOf('day')
  return { start, end }
}

export default class MetricsService {
  public async summary(restaurantId: string, from?: string, to?: string) {
    const { start, end } = parseRange(from, to)

    const revenueRows = await db
      .from('comandas')
      .where('restaurant_id', restaurantId)
      .where('status', ComandaStatus.CLOSED)
      .whereBetween('closed_at', [start.toJSDate(), end.toJSDate()])
      .sum({ revenue: 'total_amount' })
      .count({ closedCount: '*' })

    const revenue = Number(revenueRows[0]?.revenue ?? 0)
    const closedCount = Number(revenueRows[0]?.closedCount ?? 0)
    const avgTicket = closedCount > 0 ? revenue / closedCount : 0

    const openRows = await db
      .from('comandas')
      .where('restaurant_id', restaurantId)
      .where('status', ComandaStatus.OPEN)
      .count({ openCount: '*' })

    const openCount = Number(openRows[0]?.openCount ?? 0)

    const tablesRows = await db
      .from('comandas')
      .where('restaurant_id', restaurantId)
      .where('status', ComandaStatus.CLOSED)
      .whereBetween('closed_at', [start.toJSDate(), end.toJSDate()])
      .countDistinct({ tablesServed: 'table_id' })

    const tablesServed = Number(tablesRows[0]?.tablesServed ?? 0)

    return {
      range: { from: start.toISODate(), to: end.toISODate() },
      revenue: revenue.toFixed(2),
      ticketAverage: avgTicket.toFixed(2),
      comandas: { open: openCount, closed: closedCount },
      tablesServed,
    }
  }

  public async topProducts(restaurantId: string, from?: string, to?: string) {
    const { start, end } = parseRange(from, to)

    const rows = await db
      .from('order_items')
      .join('orders', 'orders.id', 'order_items.order_id')
      .join('comandas', 'comandas.id', 'orders.comanda_id')
      .join('products', 'products.id', 'order_items.product_id')
      .where('order_items.restaurant_id', restaurantId)
      .where('comandas.status', ComandaStatus.CLOSED)
      .whereBetween('comandas.closed_at', [start.toJSDate(), end.toJSDate()])
      .select('products.id as productId', 'products.name as name')
      .sum({ revenue: 'order_items.subtotal' })
      .sum({ quantity: 'order_items.quantity' })
      .groupBy('products.id', 'products.name')
      .orderBy([{ column: 'revenue', order: 'desc' }])
      .limit(20)

    return rows.map((r: any) => ({
      productId: r.productId,
      name: r.name,
      quantity: Number(r.quantity ?? 0),
      revenue: Number(r.revenue ?? 0).toFixed(2),
    }))
  }

  public async byHour(restaurantId: string, from?: string, to?: string) {
    const { start, end } = parseRange(from, to)

    const rows = await db
      .from('orders')
      .join('order_items', 'order_items.order_id', 'orders.id')
      .where('orders.restaurant_id', restaurantId)
      .whereBetween('orders.created_at', [start.toJSDate(), end.toJSDate()])
      .select(db.raw(`date_trunc('hour', orders.created_at) as hour`))
      .countDistinct({ ordersCount: 'orders.id' })
      .sum({ revenue: 'order_items.subtotal' })
      .groupBy('hour')
      .orderBy('hour', 'asc')

    return rows.map((r: any) => ({
      hour: DateTime.fromJSDate(new Date(r.hour)).toISO(),
      ordersCount: Number(r.ordersCount ?? 0),
      revenue: Number(r.revenue ?? 0).toFixed(2),
    }))
  }

  public async byWaiter(restaurantId: string, from?: string, to?: string) {
    const { start, end } = parseRange(from, to)

    const rows = await db
      .from('orders')
      .join('waiters', 'waiters.id', 'orders.operational_waiter_id')
      .join('comandas', 'comandas.id', 'orders.comanda_id')
      .join('order_items', 'order_items.order_id', 'orders.id')
      .where('orders.restaurant_id', restaurantId)
      .where('comandas.status', ComandaStatus.CLOSED)
      .whereBetween('comandas.closed_at', [start.toJSDate(), end.toJSDate()])
      .select('waiters.id as waiterId', 'waiters.name as name')
      .countDistinct({ ordersCount: 'orders.id' })
      .sum({ revenue: 'order_items.subtotal' })
      .groupBy('waiters.id', 'waiters.name')
      .orderBy([{ column: 'revenue', order: 'desc' }])

    return rows.map((r: any) => ({
      waiterId: r.waiterId,
      name: r.name,
      ordersCount: Number(r.ordersCount ?? 0),
      revenue: Number(r.revenue ?? 0).toFixed(2),
    }))
  }
}
