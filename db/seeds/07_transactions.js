/**
 * Transactions and points_balance updates.
 *
 * Eldest (3): earned 50 (10+30+10), spent 40 (10+20+10) → balance 10
 * Youngest (4): earned 80 (10+50+20), spent 60 (10+10+20+20) → balance 20
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('transactions').insert([
    // --- chore_approved ---
    { // assignment 1: make bed (10pts), Eldest
      child_id: 3,
      amount: 10,
      source: 'chore_approved',
      reference_id: 1,
      created_at: '2026-03-01T08:00:00Z'
    },{ // assignment 2: make bed (10pts), Youngest
      child_id: 4,
      amount: 10,
      source: 'chore_approved',
      reference_id: 2,
      created_at: '2026-03-01T08:10:00Z'
    },{ // assignment 16: homework (30pts), Eldest
      child_id: 3,
      amount: 30,
      source: 'chore_approved',
      reference_id: 16,
      created_at: '2026-02-28T17:00:00Z'
    },{ // assignment 17: take out trash (10pts), Eldest
      child_id: 3,
      amount: 10,
      source: 'chore_approved',
      reference_id: 17,
      created_at: '2026-02-28T16:30:00Z'
    },{ // assignment 12: clean bathroom (50pts), Youngest
      child_id: 4,
      amount: 50,
      source: 'chore_approved',
      reference_id: 12,
      created_at: '2026-03-02T11:00:00Z'
    },{ // assignment 18: do dishes (20pts), Youngest
      child_id: 4,
      amount: 20,
      source: 'chore_approved',
      reference_id: 18,
      created_at: '2026-03-03T18:15:00Z'
    },

    // --- reward_contribution ---
    { // reward 4 (Movie Night) — Eldest
      child_id: 3,
      amount: -10,
      source: 'reward_contribution',
      reference_id: 4,
      created_at: '2026-03-02T14:00:00Z'
    },{ // reward 4 (Movie Night) — Youngest
      child_id: 4,
      amount: -20,
      source: 'reward_contribution',
      reference_id: 4,
      created_at: '2026-03-02T14:30:00Z'
    },{ // reward 3 (Beast Burger) — Eldest
      child_id: 3,
      amount: -20,
      source: 'reward_contribution',
      reference_id: 3,
      created_at: '2026-03-03T12:00:00Z'
    },{ // reward 3 (Beast Burger) — Youngest
      child_id: 4,
      amount: -20,
      source: 'reward_contribution',
      reference_id: 3,
      created_at: '2026-03-03T12:30:00Z'
    },{ // reward 2 (SF6) — Eldest
      child_id: 3,
      amount: -10,
      source: 'reward_contribution',
      reference_id: 2,
      created_at: '2026-03-04T10:00:00Z'
    },{ // reward 2 (SF6) — Youngest
      child_id: 4,
      amount: -10,
      source: 'reward_contribution',
      reference_id: 2,
      created_at: '2026-03-04T10:30:00Z'
    },{ // reward 2 (SF6) — Youngest (refund requested)
      child_id: 4,
      amount: -10,
      source: 'reward_contribution',
      reference_id: 2,
      created_at: '2026-03-05T09:00:00Z'
    }
  ])

  // Set points_balance to match transaction totals
  await knex('users').where({ id: 3 }).update({ points_balance: 10 })
  await knex('users').where({ id: 4 }).update({ points_balance: 20 })
}
