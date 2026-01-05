import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Order from '#models/order'
import { PrintJobStatus } from '#utils/enums'

export default class PrintJob extends BaseModel {
  static readonly table = 'print_jobs'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column({ columnName: 'order_id' })
  declare orderId: string

  @belongsTo(() => Order, { foreignKey: 'orderId' })
  declare order: BelongsTo<typeof Order>

  @column()
  declare status: PrintJobStatus

  @column()
  declare payload: any // jsonb

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
