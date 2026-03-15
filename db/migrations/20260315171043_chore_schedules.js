/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('chore_schedules', table => {
    table.increments('id')
    table.integer('chore_id').unsigned().references('id').inTable('chores').notNullable().onDelete('CASCADE')
    table.integer('child_id').unsigned().references('id').inTable('users').notNullable().onDelete('RESTRICT')
    table.string('frequency').notNullable()
    table.integer('day_of_week')
    table.integer('day_of_month')
    table.boolean('active').notNullable().defaultTo(true)
    table.timestamp('last_generated_at')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.unique(['chore_id', 'child_id'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('chore_schedules')
};
