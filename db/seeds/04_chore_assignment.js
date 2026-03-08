/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('chore_assignments')
    .insert([
      {
        chore_id: 1,
        child_id: 3,
        status: 'assigned'
      },{
        chore_id: 1,
        child_id: 4,
        status: 'assigned',
        completed_at: '2026-03-01T09:15:00Z'
      },{
        chore_id: 2,
        child_id: 3,
        status: 'assigned'
      },{
        chore_id: 2,
        child_id: 4,
        status: 'assigned'
      },{
        chore_id: 3,
        child_id: 4,
        status: 'assigned'
      },{
        chore_id: 4,
        child_id: 3,
        status: 'rejected',
        completed_at: '2026-02-28T14:00:00Z',
        reviewed_by: 1,
        reviewed_at: '2026-02-28T16:30:00Z'
      },{
        chore_id: 5,
        child_id: 3,
        status: 'approved',
        completed_at: '2026-02-27T11:00:00Z',
        reviewed_by: 2,
        reviewed_at: '2026-02-27T13:45:00Z'
      },{
        chore_id: 6,
        child_id: 3,
        status: 'assigned'
      },{
        chore_id: 6,
        child_id: 4,
        status: 'assigned'
      },{
        chore_id: 7,
        child_id: 4,
        status: 'approved',
        completed_at: '2026-03-02T08:00:00Z'
      },{
        chore_id: 8,
        child_id: 3,
        status: 'assigned'
      },{
        chore_id: 8,
        child_id: 4,
        status: 'assigned'
      }
    ]);
};
