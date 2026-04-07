/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * Uses relative dates so the child dashboard always has relevant data.
 * d(n) = n days ago, h(n) = n hours ago
 */
exports.seed = async function(knex) {
  const now = new Date()
  const d = (days) => new Date(now - days * 86400000).toISOString()
  const h = (hours) => new Date(now - hours * 3600000).toISOString()

  await knex('chore_assignments')
    .insert([
      { // 1 — approved yesterday (make bed, Bart)
        chore_id: 1,
        child_id: 3,
        status: 'approved',
        assigned_at: d(1),
        started_at: h(23),
        submitted_at: h(22),
        reviewed_by: 1,
        reviewed_at: h(21),
        completed_at: h(21)
      },{ // 2 — approved yesterday (make bed, Lisa)
        chore_id: 1,
        child_id: 4,
        status: 'approved',
        assigned_at: d(1),
        started_at: h(22),
        submitted_at: h(21),
        reviewed_by: 2,
        reviewed_at: h(20),
        completed_at: h(20)
      },{ // 3 — submitted today (dog poop, Bart)
        chore_id: 2,
        child_id: 3,
        status: 'submitted',
        assigned_at: d(0),
        started_at: h(3),
        submitted_at: h(2)
      },{ // 4 — in_progress today (dog poop, Lisa)
        chore_id: 2,
        child_id: 4,
        status: 'in_progress',
        assigned_at: d(0),
        started_at: h(1)
      },{ // 5 — paused today (do dishes, Lisa)
        chore_id: 3,
        child_id: 4,
        status: 'paused',
        assigned_at: d(0),
        started_at: h(4),
        paused_at: h(3),
        pause_count: 1
      },{ // 6 — rejected (clean baseboards, Bart)
        chore_id: 4,
        child_id: 3,
        status: 'rejected',
        assigned_at: d(2),
        started_at: h(50),
        submitted_at: h(49),
        reviewed_by: 1,
        reviewed_at: h(48)
      },{ // 7 — parent_paused (mop floor, Bart)
        chore_id: 5,
        child_id: 3,
        status: 'parent_paused',
        assigned_at: d(0),
        started_at: h(5),
        paused_at: h(4)
      },{ // 8 — assigned today (homework, Bart)
        chore_id: 6,
        child_id: 3,
        status: 'assigned',
        assigned_at: d(0)
      },{ // 9 — assigned today (homework, Lisa)
        chore_id: 6,
        child_id: 4,
        status: 'assigned',
        assigned_at: d(0)
      },{ // 10 — dismissed (take out trash, Lisa)
        chore_id: 7,
        child_id: 4,
        status: 'dismissed',
        assigned_at: d(5),
        started_at: h(120),
        reviewed_by: 1,
        reviewed_at: h(119)
      },{ // 11 — canceled (clean bathroom, Bart)
        chore_id: 8,
        child_id: 3,
        status: 'canceled',
        assigned_at: d(6)
      },{ // 12 — approved 2 days ago (clean bathroom, Lisa)
        chore_id: 8,
        child_id: 4,
        status: 'approved',
        assigned_at: d(2),
        started_at: h(50),
        submitted_at: h(49),
        reviewed_by: 2,
        reviewed_at: h(48),
        completed_at: h(48)
      },{ // 13 — unassigned (mop floor)
        chore_id: 5,
        child_id: null,
        status: 'unassigned',
        assigned_at: d(0)
      },{ // 14 — unassigned (take out trash)
        chore_id: 7,
        child_id: null,
        status: 'unassigned',
        assigned_at: d(0)
      },{ // 15 — in_progress today (do dishes, Bart)
        chore_id: 3,
        child_id: 3,
        status: 'in_progress',
        assigned_at: d(0),
        started_at: h(2)
      },{ // 16 — approved 3 days ago (homework, Bart)
        chore_id: 6,
        child_id: 3,
        status: 'approved',
        assigned_at: d(3),
        started_at: h(72),
        submitted_at: h(71),
        reviewed_by: 2,
        reviewed_at: h(70),
        completed_at: h(70)
      },{ // 17 — approved 2 days ago (take out trash, Bart)
        chore_id: 7,
        child_id: 3,
        status: 'approved',
        assigned_at: d(2),
        started_at: h(50),
        submitted_at: h(49),
        reviewed_by: 1,
        reviewed_at: h(48),
        completed_at: h(48)
      },{ // 18 — approved 1 day ago (do dishes, Lisa)
        chore_id: 3,
        child_id: 4,
        status: 'approved',
        assigned_at: d(1),
        started_at: h(26),
        submitted_at: h(25),
        reviewed_by: 1,
        reviewed_at: h(24),
        completed_at: h(24)
      },{ // 19 — missed: assigned yesterday, still assigned (make bed, Bart)
        chore_id: 1,
        child_id: 3,
        status: 'assigned',
        assigned_at: d(1)
      },{ // 20 — missed: assigned 2 days ago, still assigned (take out trash, Lisa)
        chore_id: 7,
        child_id: 4,
        status: 'assigned',
        assigned_at: d(2)
      }
    ])
}
