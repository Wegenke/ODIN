/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chore_assignments', table => {
    table.increments('id')
    table.integer('chore_id').unsigned().references('id').inTable('chores').onDelete('CASCADE').notNullable()
    table.integer('child_id').unsigned().references('id').inTable('users')
    table.string('status')
    table.timestamp('assigned_at').defaultTo(knex.fn.now())
    table.timestamp('started_at')
    table.timestamp('paused_at')
    table.integer('time_paused').defaultTo(0)
    table.integer('pause_count').defaultTo(0)
    table.timestamp('submitted_at')
    table.integer("reviewed_by").unsigned().references('id').inTable('users')
    table.timestamp('reviewed_at')
    table.timestamp('completed_at')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('chore_assignments')
};

