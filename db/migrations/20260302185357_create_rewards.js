/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('rewards', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable()
    table.integer('created_by').unsigned().references('id').inTable('users').notNullable()
    table.string('name')
    table.text('description')
    table.string('link')
    table.integer('points_required')
    table.boolean('is_shared').defaultTo(false)
    table.string('status').defaultTo('pending')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('rewards')
};
