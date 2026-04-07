/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('parent_tasks', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable().onDelete('CASCADE')
    table.integer('created_by').unsigned().references('id').inTable('users').notNullable().onDelete('RESTRICT')
    table.string('title', 255).notNullable()
    table.string('status').notNullable().defaultTo('active')
    table.integer('started_by').unsigned().references('id').inTable('users').onDelete('RESTRICT')
    table.integer('sort_order').notNullable().defaultTo(0)
    table.timestamp('archived_at')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('parent_tasks')
};
