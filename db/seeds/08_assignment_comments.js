/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('assignment_comments').insert([
    { // assignment 1 (approved make bed) — child note on submit
      assignment_id: 1,
      user_id: 3,
      comment: 'All done, bed is made!',
      created_at: '2026-03-01T07:25:00Z'
    },{ // assignment 3 (submitted dog poop) — child note on submit
      assignment_id: 3,
      user_id: 3,
      comment: 'Backyard is all cleaned up.',
      created_at: '2026-03-06T09:30:00Z'
    },{ // assignment 5 (paused do dishes) — child pause reason
      assignment_id: 5,
      user_id: 4,
      comment: 'Taking a break, hands are tired.',
      created_at: '2026-03-07T17:45:00Z'
    },{ // assignment 6 (rejected clean baseboards) — child submit note
      assignment_id: 6,
      user_id: 3,
      comment: 'Finished all the baseboards.',
      created_at: '2026-03-05T11:15:00Z'
    },{ // assignment 6 (rejected clean baseboards) — parent rejection reason
      assignment_id: 6,
      user_id: 1,
      comment: 'You missed the baseboards in the hallway. Please redo.',
      created_at: '2026-03-05T12:00:00Z'
    },{ // assignment 7 (parent_paused mop floor) — parent pause reason
      assignment_id: 7,
      user_id: 1,
      comment: 'Dinner time, finish this after.',
      created_at: '2026-03-07T15:00:00Z'
    },{ // assignment 10 (dismissed take out trash) — parent dismiss note
      assignment_id: 10,
      user_id: 1,
      comment: 'Already took the trash out myself.',
      created_at: '2026-03-04T17:00:00Z'
    },{ // assignment 12 (approved clean bathroom) — child submit note
      assignment_id: 12,
      user_id: 4,
      comment: 'Bathroom is sparkling clean!',
      created_at: '2026-03-02T10:30:00Z'
    },{ // assignment 12 (approved clean bathroom) — parent approval feedback
      assignment_id: 12,
      user_id: 2,
      comment: 'Great job, looks amazing!',
      created_at: '2026-03-02T11:00:00Z'
    }
  ])
}
