/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('reward_notes', table => {
    table.increments('id')
    table.integer('reward_id').unsigned().references('id').inTable('rewards').notNullable().onDelete('CASCADE')
    table.integer('created_by').unsigned().references('id').inTable('users').notNullable().onDelete('RESTRICT')
    table.text('body').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.index('reward_id')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('reward_notes')
};
