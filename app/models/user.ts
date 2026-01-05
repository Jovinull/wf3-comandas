import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'

import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

import Restaurant from '#models/restaurant'
import { UserRole } from '#utils/enums'

export default class User extends compose(
  BaseModel,
  withAuthFinder(() => hash.use(), {
    uids: ['email'],
    passwordColumnName: 'passwordHash',
  })
) {
  static readonly table = 'users'

  /**
   * Necessário para tokensGuard + tokensUserProvider({ tokens: 'accessTokens' })
   */
  public static accessTokens = DbAccessTokensProvider.forModel(User)

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
  public static async hashPasswordHook(user: User) {
    if (user.$dirty.passwordHash) {
      user.passwordHash = await hash.make(user.passwordHash)
    }
  }
}
