/**
 * Transactions and points_balance updates.
 *
 * Bart (3): earned 60 (10+30+10+10), spent 40 (10+20+10), adjustment -15 → balance 5
 * Lisa (4): earned 90 (10+50+20+10), spent 60 (10+10+20+20), adjustment +25 → balance 55
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const now = new Date()
  const h = (hours) => new Date(now - hours * 3600000).toISOString()

  await knex('transactions').insert([
    // --- chore_approved ---
    { child_id: 3, amount: 10, source: 'chore_approved', reference_id: 1, created_at: h(21) },
    { child_id: 4, amount: 10, source: 'chore_approved', reference_id: 2, created_at: h(20) },
    { child_id: 3, amount: 30, source: 'chore_approved', reference_id: 16, created_at: h(70) },
    { child_id: 3, amount: 10, source: 'chore_approved', reference_id: 17, created_at: h(48) },
    { child_id: 4, amount: 50, source: 'chore_approved', reference_id: 12, created_at: h(48) },
    { child_id: 4, amount: 20, source: 'chore_approved', reference_id: 18, created_at: h(24) },

    // --- reward_contribution ---
    { child_id: 3, amount: -10, source: 'reward_contribution', reference_id: 4, created_at: h(60) },
    { child_id: 4, amount: -20, source: 'reward_contribution', reference_id: 4, created_at: h(59) },
    { child_id: 3, amount: -20, source: 'reward_contribution', reference_id: 3, created_at: h(50) },
    { child_id: 4, amount: -20, source: 'reward_contribution', reference_id: 3, created_at: h(49) },
    { child_id: 3, amount: -10, source: 'reward_contribution', reference_id: 2, created_at: h(40) },
    { child_id: 4, amount: -10, source: 'reward_contribution', reference_id: 2, created_at: h(39) },
    { child_id: 4, amount: -10, source: 'reward_contribution', reference_id: 2, created_at: h(30) },

    // --- adjustments ---
    { child_id: 3, amount: -15, source: 'adjustment_penalty', reference_id: 1, created_at: h(10) },
    { child_id: 4, amount: 25, source: 'adjustment_reward', reference_id: 2, created_at: h(8) }
  ])

  // Bart: 60 earned - 40 spent - 15 penalty = 5
  await knex('users').where({ id: 3 }).update({ points_balance: 5 })
  // Lisa: 90 earned - 60 spent + 25 reward = 55
  await knex('users').where({ id: 4 }).update({ points_balance: 55 })
}
