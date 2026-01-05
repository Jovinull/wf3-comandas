import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('products', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table
        .uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('restrict')

      table.string('name', 80).notNullable()
      table.string('description', 300).nullable()
      table.decimal('price', 12, 2).notNullable()
      table.string('image_url', 500).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'is_active'])
      table.index(['restaurant_id', 'category_id'])
      table.unique(['restaurant_id', 'name'])
    })
  }

  public async down() {
    this.schema.dropTable('products')
  }
}
