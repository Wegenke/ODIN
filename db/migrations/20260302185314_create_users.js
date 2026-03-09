/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable()
    table.string('name').notNullable()
    table.string('nick_name')
    table.string('avatar').notNullable()
    table.enum('role', ['parent','child'])
    table.string('pin_hash').notNullable()
    table.string('status').defaultTo('active').notNullable()
    table.timestamp('pin_last_changed')
    table.integer('points_balance').defaultTo(0)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
