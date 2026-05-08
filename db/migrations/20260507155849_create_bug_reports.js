/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bug_reports', table => {
    table.increments('id')
    table.integer('household_id').unsigned().references('id').inTable('households').notNullable().onDelete('CASCADE')
    table.integer('user_id').unsigned().references('id').inTable('users').notNullable().onDelete('CASCADE')
    table.text('body').notNullable()
    table.string('status').notNullable().defaultTo('open')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.index(['household_id', 'status'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bug_reports')
};
