/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 *
 * Chore IDs: 1=make bed, 2=dog poop, 3=do dishes, 6=homework, 7=take out trash, 8=clean bathroom
 * Child IDs: 3=Bart, 4=Lisa
 */
exports.seed = async function(knex) {
  const now = new Date().toISOString()

  await knex('chore_schedules')
    .insert([
      { // make bed — daily for Bart
        chore_id: 1, child_id: 3,
        frequency: 'daily', day_of_week: null, day_of_month: null,
        active: true, last_generated_at: now
      },{ // make bed — daily for Lisa
        chore_id: 1, child_id: 4,
        frequency: 'daily', day_of_week: null, day_of_month: null,
        active: true, last_generated_at: now
      },{ // dog poop — weekly Thursday for Bart
        chore_id: 2, child_id: 3,
        frequency: 'weekly', day_of_week: 4, day_of_month: null,
        active: true, last_generated_at: now
      },{ // do dishes — daily for Lisa
        chore_id: 3, child_id: 4,
        frequency: 'daily', day_of_week: null, day_of_month: null,
        active: true, last_generated_at: now
      },{ // do dishes — daily for Bart
        chore_id: 3, child_id: 3,
        frequency: 'daily', day_of_week: null, day_of_month: null,
        active: true, last_generated_at: now
      },{ // homework — weekly Friday for Bart
        chore_id: 6, child_id: 3,
        frequency: 'weekly', day_of_week: 5, day_of_month: null,
        active: true, last_generated_at: now
      },{ // homework — weekly Friday for Lisa
        chore_id: 6, child_id: 4,
        frequency: 'weekly', day_of_week: 5, day_of_month: null,
        active: true, last_generated_at: now
      },{ // take out trash — Mon/Wed/Fri for Bart (multi-day weekly)
        chore_id: 7, child_id: 3,
        frequency: 'weekly', day_of_week: 1, day_of_month: null,
        active: true, last_generated_at: now
      },{ chore_id: 7, child_id: 3,
        frequency: 'weekly', day_of_week: 3, day_of_month: null,
        active: true, last_generated_at: now
      },{ chore_id: 7, child_id: 3,
        frequency: 'weekly', day_of_week: 5, day_of_month: null,
        active: true, last_generated_at: now
      },{ // take out trash — Tue/Thu/Sat for Lisa (multi-day weekly)
        chore_id: 7, child_id: 4,
        frequency: 'weekly', day_of_week: 2, day_of_month: null,
        active: true, last_generated_at: now
      },{ chore_id: 7, child_id: 4,
        frequency: 'weekly', day_of_week: 4, day_of_month: null,
        active: true, last_generated_at: now
      },{ chore_id: 7, child_id: 4,
        frequency: 'weekly', day_of_week: 6, day_of_month: null,
        active: true, last_generated_at: now
      },{ // clean bathroom — 1st and 15th for Lisa (bi-monthly)
        chore_id: 8, child_id: 4,
        frequency: 'monthly', day_of_week: null, day_of_month: 1,
        active: true, last_generated_at: now
      },{ chore_id: 8, child_id: 4,
        frequency: 'monthly', day_of_week: null, day_of_month: 15,
        active: true, last_generated_at: now
      }
    ]);
};
