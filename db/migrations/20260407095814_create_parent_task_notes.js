/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('parent_task_notes', table => {
    table.increments('id')
    table.integer('parent_task_id').unsigned().references('id').inTable('parent_tasks').notNullable().onDelete('CASCADE')
    table.integer('created_by').unsigned().references('id').inTable('users').notNullable().onDelete('RESTRICT')
    table.text('content').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('parent_task_notes')
};
