import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Table extends BaseModel {
  static readonly table = 'tables'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
