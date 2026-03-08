/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('transactions', table => {
    table.increments('id')
    table.integer('child_id').unsigned().references('id').inTable('users').notNullable()
    table.integer('amount').notNullable()
    table.string('source')
    table.integer('reference_id')
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('transactions')
};
