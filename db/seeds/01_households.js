/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
await knex.raw('TRUNCATE TABLE transactions, reward_contributions, rewards, assignment_comments, chore_assignments, chores, users, households RESTART IDENTITY CASCADE')


  await knex('households')
    .insert([
    {name: 'SIMPSONS'}
    ]);
};
