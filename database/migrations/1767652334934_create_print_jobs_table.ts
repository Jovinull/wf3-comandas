import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('print_jobs', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table.uuid('order_id').notNullable().references('id').inTable('orders').onDelete('restrict')
      table.string('status', 20).notNullable()
      table.jsonb('payload').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'status'])
      table.index(['restaurant_id', 'created_at'])
      table.unique(['order_id'])
    })
  }

  public async down() {
    this.schema.dropTable('print_jobs')
  }
}
