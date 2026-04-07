/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', table => {
    table.increments('id')
    table.integer('user_id').unsigned().references('id').inTable('users').notNullable().onDelete('CASCADE')
    table.string('token_hash').notNullable().unique()
    table.timestamp('expires_at').notNullable()
    table.boolean('revoked').notNullable().defaultTo(false)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('refresh_tokens')
};
