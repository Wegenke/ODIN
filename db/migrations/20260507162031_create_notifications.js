/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('notifications', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable().onDelete('CASCADE')
    table.integer('user_id').unsigned().references('id').inTable('users').notNullable().onDelete('CASCADE')
    table.string('type').notNullable()
    table.integer('reference_id')
    table.timestamp('seen_at')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.index(['user_id', 'seen_at'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notifications')
};
