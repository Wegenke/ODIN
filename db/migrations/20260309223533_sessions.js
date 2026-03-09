/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('session', table => {
    table.string('sid').primary()
    table.json('sess').notNullable()
    table.timestamp('expire', { precision: 6 }).notNullable().index()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('session')
}
