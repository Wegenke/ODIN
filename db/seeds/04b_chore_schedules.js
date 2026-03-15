/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * Seeds recurring schedules.
 * Chore IDs: 1=make bed, 2=dog poop, 3=do dishes, 6=homework, 7=take out trash, 8=clean bathroom
 * Child IDs: 3=Bart, 4=Lisa
 */
exports.seed = async function(knex) {
  await knex('chore_schedules')
    .insert([
      { // make bed — daily for Bart
        chore_id: 1,
        child_id: 3,
        frequency: 'daily',
        day_of_week: null,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-01T07:00:00Z'
      },{ // make bed — daily for Lisa
        chore_id: 1,
        child_id: 4,
        frequency: 'daily',
        day_of_week: null,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-01T07:00:00Z'
      },{ // dog poop — weekly Thursday for Bart
        chore_id: 2,
        child_id: 3,
        frequency: 'weekly',
        day_of_week: 4,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-06T08:00:00Z'
      },{ // do dishes — daily for Lisa
        chore_id: 3,
        child_id: 4,
        frequency: 'daily',
        day_of_week: null,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-07T17:00:00Z'
      },{ // do dishes — daily for Bart
        chore_id: 3,
        child_id: 3,
        frequency: 'daily',
        day_of_week: null,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-08T17:00:00Z'
      },{ // homework — weekly Friday for Bart
        chore_id: 6,
        child_id: 3,
        frequency: 'weekly',
        day_of_week: 5,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-07T08:00:00Z'
      },{ // homework — weekly Friday for Lisa
        chore_id: 6,
        child_id: 4,
        frequency: 'weekly',
        day_of_week: 5,
        day_of_month: null,
        active: true,
        last_generated_at: '2026-03-07T08:00:00Z'
      },{ // take out trash — daily for Bart (active: false — paused schedule)
        chore_id: 7,
        child_id: 3,
        frequency: 'daily',
        day_of_week: null,
        day_of_month: null,
        active: false,
        last_generated_at: '2026-02-28T16:00:00Z'
      },{ // clean bathroom — monthly on the 2nd for Lisa
        chore_id: 8,
        child_id: 4,
        frequency: 'monthly',
        day_of_month: 2,
        day_of_week: null,
        active: true,
        last_generated_at: '2026-03-02T09:00:00Z'
      }
    ]);
};
