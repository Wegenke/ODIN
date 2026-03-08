/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('assignment_comments', table => {
    table.increments('id')
    table.integer('assignment_id').unsigned().references('id').inTable('chore_assignments').notNullable()
    table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
    table.string('comment', 500)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('assignment_comments')
};
