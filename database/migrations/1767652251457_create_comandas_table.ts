import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('comandas', (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('restrict')

      table.uuid('table_id').notNullable().references('id').inTable('tables').onDelete('restrict')

      table.string('status', 20).notNullable()
      table.timestamp('opened_at', { useTz: true }).notNullable()
      table.timestamp('closed_at', { useTz: true }).nullable()

      // total final (preenchido ao fechar), melhora performance das métricas
      table.decimal('total_amount', 12, 2).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['restaurant_id'])
      table.index(['restaurant_id', 'table_id'])
      table.index(['restaurant_id', 'status'])
      table.index(['restaurant_id', 'opened_at'])
      table.index(['restaurant_id', 'closed_at'])
    })

    // 1 comanda OPEN por mesa (Postgres partial unique index)
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE UNIQUE INDEX IF NOT EXISTS comandas_one_open_per_table
        ON comandas (restaurant_id, table_id)
        WHERE status = 'OPEN';
      `)
    })
  }

  public async down() {
    this.schema.dropTable('comandas')
    this.defer(async (db) => {
      await db.rawQuery(`DROP INDEX IF EXISTS comandas_one_open_per_table;`)
    })
  }
}
