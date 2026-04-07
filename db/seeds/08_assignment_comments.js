/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const now = new Date()
  const h = (hours) => new Date(now - hours * 3600000).toISOString()

  await knex('assignment_comments').insert([
    { // assignment 1 (approved make bed) — child note
      assignment_id: 1, user_id: 3,
      comment: 'All done, bed is made!',
      created_at: h(22)
    },{ // assignment 3 (submitted dog poop) — child note
      assignment_id: 3, user_id: 3,
      comment: 'Backyard is all cleaned up.',
      created_at: h(2)
    },{ // assignment 5 (paused do dishes) — child pause reason
      assignment_id: 5, user_id: 4,
      comment: 'Taking a break, hands are tired.',
      created_at: h(3)
    },{ // assignment 6 (rejected clean baseboards) — child submit note
      assignment_id: 6, user_id: 3,
      comment: 'Finished all the baseboards.',
      created_at: h(49)
    },{ // assignment 6 (rejected clean baseboards) — parent rejection reason
      assignment_id: 6, user_id: 1,
      comment: 'You missed the baseboards in the hallway. Please redo.',
      created_at: h(48)
    },{ // assignment 7 (parent_paused mop floor) — parent pause reason
      assignment_id: 7, user_id: 1,
      comment: 'Dinner time, finish this after.',
      created_at: h(4)
    },{ // assignment 10 (dismissed take out trash) — parent dismiss note
      assignment_id: 10, user_id: 1,
      comment: 'Already took the trash out myself.',
      created_at: h(119)
    },{ // assignment 12 (approved clean bathroom) — child submit note
      assignment_id: 12, user_id: 4,
      comment: 'Bathroom is sparkling clean!',
      created_at: h(49)
    },{ // assignment 12 (approved clean bathroom) — parent approval feedback
      assignment_id: 12, user_id: 2,
      comment: 'Great job, looks amazing!',
      created_at: h(48)
    },{ // assignment 19 (missed make bed) — child explanation
      assignment_id: 19, user_id: 3,
      comment: 'I fell asleep early, sorry.',
      created_at: h(6)
    }
  ])
}
