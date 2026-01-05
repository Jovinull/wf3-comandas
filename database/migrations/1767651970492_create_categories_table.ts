import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('categories', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table.string('name', 60).notNullable()
      table.integer('sort_order').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'is_active'])
      table.unique(['restaurant_id', 'name'])
    })
  }

  public async down() {
    this.schema.dropTable('categories')
  }
}
