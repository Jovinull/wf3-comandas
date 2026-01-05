import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'

import Restaurant from '#models/restaurant'
import { UserRole } from '#utils/enums'

export default class User extends BaseModel {
  static readonly table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'restaurant_id' })
  declare restaurantId: string

  @belongsTo(() => Restaurant, { foreignKey: 'restaurantId' })
  declare restaurant: BelongsTo<typeof Restaurant>

  @column()
  declare email: string

  @column()
  declare role: UserRole

  @column({ serializeAs: null, columnName: 'password_hash' })
  declare passwordHash: string

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.passwordHash) {
      user.passwordHash = await hash.make(user.passwordHash)
    }
  }
}
