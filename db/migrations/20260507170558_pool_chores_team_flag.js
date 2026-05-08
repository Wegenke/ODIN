/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('chores', table => {
    table.boolean('team_chore').notNullable().defaultTo(false)
  })
  await knex.schema.alterTable('chore_schedules', table => {
    table.integer('child_id').unsigned().nullable().alter()
  })
  await knex.schema.alterTable('chore_assignments', table => {
    table.timestamp('expires_at').nullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('chore_assignments', table => {
    table.dropColumn('expires_at')
  })
  await knex.schema.alterTable('chore_schedules', table => {
    table.integer('child_id').unsigned().notNullable().alter()
  })
  await knex.schema.alterTable('chores', table => {
    table.dropColumn('team_chore')
  })
};
