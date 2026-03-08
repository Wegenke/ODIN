/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('reward_contributions', table => {
    table.increments('id')
    table.integer('reward_id').unsigned().references('id').inTable('rewards').notNullable()
    table.integer('child_id').unsigned().references('id').inTable('users').notNullable()
    table.integer('points').notNullable()
    table.boolean('refund_requested').defaultTo(false).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('reward_contributions')
};
