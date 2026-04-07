/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('point_adjustments', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable().onDelete('CASCADE')
    table.integer('child_id').unsigned().references('id').inTable('users').notNullable().onDelete('CASCADE')
    table.integer('parent_id').unsigned().references('id').inTable('users').notNullable().onDelete('RESTRICT')
    table.integer('points').notNullable()
    table.text('reason').notNullable()
    table.boolean('seen').notNullable().defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('point_adjustments')
};
