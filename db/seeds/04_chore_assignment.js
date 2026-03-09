/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('chore_assignments')
    .insert([
      { // 1 — approved (make bed, Eldest)
        chore_id: 1,
        child_id: 3,
        status: 'approved',
        assigned_at: '2026-03-01T07:00:00Z',
        started_at: '2026-03-01T07:15:00Z',
        submitted_at: '2026-03-01T07:25:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-03-01T08:00:00Z',
        completed_at: '2026-03-01T08:00:00Z'
      },{ // 2 — approved (make bed, Youngest)
        chore_id: 1,
        child_id: 4,
        status: 'approved',
        assigned_at: '2026-03-01T07:00:00Z',
        started_at: '2026-03-01T07:30:00Z',
        submitted_at: '2026-03-01T07:40:00Z',
        reviewed_by: 2,
        reviewed_at: '2026-03-01T08:10:00Z',
        completed_at: '2026-03-01T08:10:00Z'
      },{ // 3 — submitted (dog poop, Eldest)
        chore_id: 2,
        child_id: 3,
        status: 'submitted',
        assigned_at: '2026-03-06T08:00:00Z',
        started_at: '2026-03-06T09:00:00Z',
        submitted_at: '2026-03-06T09:30:00Z'
      },{ // 4 — in_progress (dog poop, Youngest)
        chore_id: 2,
        child_id: 4,
        status: 'in_progress',
        assigned_at: '2026-03-06T08:00:00Z',
        started_at: '2026-03-06T09:15:00Z'
      },{ // 5 — paused (do dishes, Youngest)
        chore_id: 3,
        child_id: 4,
        status: 'paused',
        assigned_at: '2026-03-07T17:00:00Z',
        started_at: '2026-03-07T17:30:00Z',
        paused_at: '2026-03-07T17:45:00Z',
        pause_count: 1
      },{ // 6 — rejected (clean baseboards, Eldest)
        chore_id: 4,
        child_id: 3,
        status: 'rejected',
        assigned_at: '2026-03-05T10:00:00Z',
        started_at: '2026-03-05T10:30:00Z',
        submitted_at: '2026-03-05T11:15:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-03-05T12:00:00Z'
      },{ // 7 — parent_paused (mop floor, Eldest)
        chore_id: 5,
        child_id: 3,
        status: 'parent_paused',
        assigned_at: '2026-03-07T14:00:00Z',
        started_at: '2026-03-07T14:30:00Z',
        paused_at: '2026-03-07T15:00:00Z'
      },{ // 8 — assigned (homework, Eldest)
        chore_id: 6,
        child_id: 3,
        status: 'assigned',
        assigned_at: '2026-03-07T08:00:00Z'
      },{ // 9 — assigned (homework, Youngest)
        chore_id: 6,
        child_id: 4,
        status: 'assigned',
        assigned_at: '2026-03-07T08:00:00Z'
      },{ // 10 — dismissed (take out trash, Youngest)
        chore_id: 7,
        child_id: 4,
        status: 'dismissed',
        assigned_at: '2026-03-04T16:00:00Z',
        started_at: '2026-03-04T16:30:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-03-04T17:00:00Z'
      },{ // 11 — canceled (clean bathroom, Eldest)
        chore_id: 8,
        child_id: 3,
        status: 'canceled',
        assigned_at: '2026-03-03T09:00:00Z'
      },{ // 12 — approved (clean bathroom, Youngest)
        chore_id: 8,
        child_id: 4,
        status: 'approved',
        assigned_at: '2026-03-02T09:00:00Z',
        started_at: '2026-03-02T09:30:00Z',
        submitted_at: '2026-03-02T10:30:00Z',
        reviewed_by: 2,
        reviewed_at: '2026-03-02T11:00:00Z',
        completed_at: '2026-03-02T11:00:00Z'
      },{ // 13 — unassigned (mop floor)
        chore_id: 5,
        child_id: null,
        status: 'unassigned',
        assigned_at: '2026-03-08T08:00:00Z'
      },{ // 14 — unassigned (take out trash)
        chore_id: 7,
        child_id: null,
        status: 'unassigned',
        assigned_at: '2026-03-08T08:00:00Z'
      },{ // 15 — in_progress (do dishes, Eldest)
        chore_id: 3,
        child_id: 3,
        status: 'in_progress',
        assigned_at: '2026-03-08T17:00:00Z',
        started_at: '2026-03-08T17:15:00Z'
      },{ // 16 — approved (homework, Eldest)
        chore_id: 6,
        child_id: 3,
        status: 'approved',
        assigned_at: '2026-02-28T08:00:00Z',
        started_at: '2026-02-28T15:00:00Z',
        submitted_at: '2026-02-28T16:00:00Z',
        reviewed_by: 2,
        reviewed_at: '2026-02-28T17:00:00Z',
        completed_at: '2026-02-28T17:00:00Z'
      },{ // 17 — approved (take out trash, Eldest)
        chore_id: 7,
        child_id: 3,
        status: 'approved',
        assigned_at: '2026-02-28T16:00:00Z',
        started_at: '2026-02-28T16:10:00Z',
        submitted_at: '2026-02-28T16:20:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-02-28T16:30:00Z',
        completed_at: '2026-02-28T16:30:00Z'
      },{ // 18 — approved (do dishes, Youngest)
        chore_id: 3,
        child_id: 4,
        status: 'approved',
        assigned_at: '2026-03-03T17:00:00Z',
        started_at: '2026-03-03T17:30:00Z',
        submitted_at: '2026-03-03T18:00:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-03-03T18:15:00Z',
        completed_at: '2026-03-03T18:15:00Z'
      }
    ])
}
