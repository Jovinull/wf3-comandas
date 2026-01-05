import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('order_items', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('restrict')
      table
        .uuid('product_id')
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('restrict')

      table.integer('quantity').notNullable()
      table.decimal('unit_price_snapshot', 12, 2).notNullable()
      table.decimal('subtotal', 12, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'order_id'])
      table.index(['restaurant_id', 'product_id'])
    })
  }

  public async down() {
    this.schema.dropTable('order_items')
  }
}
