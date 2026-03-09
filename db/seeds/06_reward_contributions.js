/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('reward_contributions').insert([
    { // SF6 — Eldest partial
      reward_id: 2,
      child_id: 3,
      points: 10,
      created_at: '2026-03-04T10:00:00Z'
    },{ // SF6 — Youngest partial
      reward_id: 2,
      child_id: 4,
      points: 10,
      created_at: '2026-03-04T10:30:00Z'
    },{ // SF6 — Youngest refund requested
      reward_id: 2,
      child_id: 4,
      points: 10,
      refund_requested: true,
      created_at: '2026-03-05T09:00:00Z'
    },{ // Beast Burger — Eldest
      reward_id: 3,
      child_id: 3,
      points: 20,
      created_at: '2026-03-03T12:00:00Z'
    },{ // Beast Burger — Youngest (fully funded together)
      reward_id: 3,
      child_id: 4,
      points: 20,
      created_at: '2026-03-03T12:30:00Z'
    },{ // Movie Night — Eldest
      reward_id: 4,
      child_id: 3,
      points: 10,
      created_at: '2026-03-02T14:00:00Z'
    },{ // Movie Night — Youngest (fully funded together)
      reward_id: 4,
      child_id: 4,
      points: 20,
      created_at: '2026-03-02T14:30:00Z'
    }
  ])
}
