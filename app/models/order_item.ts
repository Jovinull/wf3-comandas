import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import Product from '#models/product'

export default class OrderItem extends BaseModel {
  static readonly table = 'order_items'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column({ columnName: 'order_id' })
  declare orderId: string

  @belongsTo(() => Order, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof Order>

  @column({ columnName: 'product_id' })
  declare productId: string

  @belongsTo(() => Product, { foreignKey: 'productId' })
  declare product: BelongsTo<typeof Product>

  @column()
  declare quantity: number

  @column({ columnName: 'unit_price_snapshot' })
  declare unitPriceSnapshot: string // numeric -> string

  @column()
  declare subtotal: string // numeric -> string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
