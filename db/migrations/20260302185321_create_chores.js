/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chores', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable()
    table.string('title')
    table.text('description')
    table.string('emoji').notNullable()
    table.integer('points')
    table.integer("created_by").unsigned().references('id').inTable('users').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chores')
};
