import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'

export default class Category extends BaseModel {
  static readonly table = 'categories'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @column()
  declare name: string

  @column({ columnName: 'sort_order' })
  declare sortOrder: number | null

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Product)
  declare products: HasMany<typeof Product>
}
