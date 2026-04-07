/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * Parent IDs: 1=Homer, 2=Marge
 * Child IDs: 3=Bart, 4=Lisa
 */
exports.seed = async function(knex) {
  const now = new Date()
  const h = (hours) => new Date(now - hours * 3600000).toISOString()

  await knex('point_adjustments').insert([
    { // 1 — penalty for Bart (seen)
      household_id: 1,
      child_id: 3,
      parent_id: 2,
      points: -15,
      reason: 'Didn\'t brush teeth two days in a row',
      seen: true,
      created_at: h(10)
    },{ // 2 — reward for Lisa (unseen — will show on login)
      household_id: 1,
      child_id: 4,
      parent_id: 1,
      points: 25,
      reason: 'Helped the neighbor carry groceries without being asked',
      seen: false,
      created_at: h(8)
    },{ // 3 — reward for Bart (unseen — will show on login)
      household_id: 1,
      child_id: 3,
      parent_id: 1,
      points: 10,
      reason: 'Shared toys with younger cousin nicely',
      seen: false,
      created_at: h(5)
    }
  ])
}
