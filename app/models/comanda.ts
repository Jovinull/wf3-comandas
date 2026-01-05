import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import { ComandaStatus } from '#utils/enums'

export default class Comanda extends BaseModel {
  static readonly table = 'comandas'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column({ columnName: 'table_id' })
  declare tableId: string

  @belongsTo(() => Table, { foreignKey: 'tableId' })
  declare table: BelongsTo<typeof Table>

  @column()
  declare status: ComandaStatus

  @column.dateTime({ columnName: 'opened_at' })
  declare openedAt: DateTime

  @column.dateTime({ columnName: 'closed_at' })
  declare closedAt: DateTime | null

  @column({ columnName: 'total_amount' })
  declare totalAmount: string | null // numeric -> string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
