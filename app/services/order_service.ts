import db from '@adonisjs/lucid/services/db'
import AppError from '#exceptions/app_error'
import Table from '#models/table'
import Waiter from '#models/waiter'
import Comanda from '#models/comanda'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Product from '#models/product'
import PrintJob from '#models/print_job'
import { ComandaStatus, OrderStatus, PrintJobStatus } from '#utils/enums'
import { DateTime } from 'luxon'

type CreateOrderInput = {
  restaurantId: string
  tableId: string
  operationalWaiterId: string
  createdByUserId: string
  note?: string
  items: Array<{ productId: string; quantity: number }>
}

export default class OrderService {
  public async createOrderForTable(input: CreateOrderInput) {
    const now = DateTime.now()

    return await db.transaction(async (trx) => {
      // 1) valida mesa (tenant + ativa) e trava para concorrência
      const table = await Table.query({ client: trx })
        .where('id', input.tableId)
        .where('restaurantId', input.restaurantId)
        .where('isActive', true)
        .forUpdate()
        .first()

      if (!table) throw new AppError('NOT_FOUND', 'Table not found', 404)

      // 2) valida garçom operacional (tenant + ativo)
      const waiter = await Waiter.query({ client: trx })
        .where('id', input.operationalWaiterId)
        .where('restaurantId', input.restaurantId)
        .where('isActive', true)
        .first()

      if (!waiter) throw new AppError('CONFLICT', 'Invalid operationalWaiterId', 409)

      // 3) encontra comanda aberta (e trava). Se não existir, cria.
      let comanda = await Comanda.query({ client: trx })
        .where('restaurantId', input.restaurantId)
        .where('tableId', input.tableId)
        .where('status', ComandaStatus.OPEN)
        .forUpdate()
        .first()

      if (!comanda) {
        try {
          comanda = await Comanda.create(
            {
              restaurantId: input.restaurantId,
              tableId: input.tableId,
              status: ComandaStatus.OPEN,
              openedAt: now,
              closedAt: null,
              totalAmount: null,
            },
            { client: trx }
          )
        } catch (e: any) {
          // corrida: índice parcial pode ter bloqueado
          if (e?.code === '23505') {
            comanda = await Comanda.query({ client: trx })
              .where('restaurantId', input.restaurantId)
              .where('tableId', input.tableId)
              .where('status', ComandaStatus.OPEN)
              .forUpdate()
              .first()

            if (!comanda) throw e
          } else {
            throw e
          }
        }
      }

      if (comanda.status !== ComandaStatus.OPEN) {
        throw new AppError('CONFLICT', 'Comanda is closed', 409)
      }

      // 4) valida produtos (tenant + ativos)
      const productIds = Array.from(new Set(input.items.map((i) => i.productId)))
      const products = await Product.query({ client: trx })
        .where('restaurantId', input.restaurantId)
        .where('isActive', true)
        .whereIn('id', productIds)

      if (products.length !== productIds.length) {
        throw new AppError('CONFLICT', 'One or more products are invalid/inactive', 409)
      }

      const productMap = new Map(products.map((p) => [p.id, p]))

      // 5) cria Order
      const order = await Order.create(
        {
          restaurantId: input.restaurantId,
          comandaId: comanda.id,
          operationalWaiterId: waiter.id,
          createdByUserId: input.createdByUserId,
          note: input.note?.trim() || null,
          status: OrderStatus.CREATED,
        },
        { client: trx }
      )

      // 6) cria OrderItems com snapshot de preço
      const itemsToCreate = input.items.map((it) => {
        const product = productMap.get(it.productId)!
        const unit = Number(product.price)
        const subtotal = unit * it.quantity

        return {
          restaurantId: input.restaurantId,
          orderId: order.id,
          productId: product.id,
          quantity: it.quantity,
          unitPriceSnapshot: unit.toFixed(2),
          subtotal: subtotal.toFixed(2),
        }
      })

      await OrderItem.createMany(itemsToCreate, { client: trx })

      // 7) cria PrintJob (payload pronto para cozinha)
      const payload = {
        orderId: order.id,
        comandaId: comanda.id,
        table: { id: table.id, name: table.name, description: table.description },
        operationalWaiter: { id: waiter.id, name: waiter.name },
        note: order.note,
        createdAt: order.createdAt?.toISO?.() ?? now.toISO(),
        items: input.items.map((it) => {
          const product = productMap.get(it.productId)!
          const unit = Number(product.price)
          const subtotal = unit * it.quantity
          return {
            productId: product.id,
            name: product.name,
            quantity: it.quantity,
            unitPrice: unit.toFixed(2),
            subtotal: subtotal.toFixed(2),
          }
        }),
      }

      await PrintJob.create(
        {
          restaurantId: input.restaurantId,
          orderId: order.id,
          status: PrintJobStatus.PENDING,
          payload,
        },
        { client: trx }
      )

      return {
        comandaId: comanda.id,
        orderId: order.id,
      }
    })
  }
}
