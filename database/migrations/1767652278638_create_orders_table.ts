import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('orders', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table
        .uuid('comanda_id')
        .notNullable()
        .references('id')
        .inTable('comandas')
        .onDelete('restrict')
      table
        .uuid('operational_waiter_id')
        .notNullable()
        .references('id')
        .inTable('waiters')
        .onDelete('restrict')
      table
        .uuid('created_by_user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('restrict')

      table.string('note', 300).nullable()
      table.string('status', 20).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'comanda_id'])
      table.index(['restaurant_id', 'operational_waiter_id'])
      table.index(['restaurant_id', 'created_at'])
    })
  }

  public async down() {
    this.schema.dropTable('orders')
  }
}
