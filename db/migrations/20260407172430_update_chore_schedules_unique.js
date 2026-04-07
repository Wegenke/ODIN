/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('chore_schedules', table => {
    table.dropUnique(['chore_id', 'child_id'])
    table.unique(['chore_id', 'child_id', 'frequency', 'day_of_week', 'day_of_month'])
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('chore_schedules', table => {
    table.dropUnique(['chore_id', 'child_id', 'frequency', 'day_of_week', 'day_of_month'])
    table.unique(['chore_id', 'child_id'])
  })
};
