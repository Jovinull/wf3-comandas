import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Comanda from '#models/comanda'
import Waiter from '#models/waiter'
import User from '#models/user'
import OrderItem from '#models/order_item'
import { OrderStatus } from '#utils/enums'

export default class Order extends BaseModel {
  static readonly table = 'orders'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column({ columnName: 'comanda_id' })
  declare comandaId: string

  @belongsTo(() => Comanda, { foreignKey: 'comandaId' })
  declare comanda: BelongsTo<typeof Comanda>

  @column({ columnName: 'operational_waiter_id' })
  declare operationalWaiterId: string

  @belongsTo(() => Waiter, { foreignKey: 'operationalWaiterId' })
  declare operationalWaiter: BelongsTo<typeof Waiter>

  @column({ columnName: 'created_by_user_id' })
  declare createdByUserId: string

  @belongsTo(() => User, { foreignKey: 'createdByUserId' })
  declare createdByUser: BelongsTo<typeof User>

  @column()
  declare note: string | null

  @column()
  declare status: OrderStatus

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
