/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('chores')
    .insert([
      {
        household_id: 1,
        title: 'make bed',
        description: "Bed needs to be made as soon as you wake up.",
        emoji:'🛏️',
        points: 10,
        created_by: 1
      },{
        household_id: 1,
        title: 'dog poop',
        description: 'Dog poo must be cleaned up every Thursday.',
        emoji:'🐕💩',
        points: 50,
        created_by: 1
      },{
        household_id: 1,
        title: 'do dishes',
        description: 'Dishwasher needs to be unloaded and loaded daily.',
        emoji:'🍽️',
        points: 20,
        created_by: 2
      },{
        household_id: 1,
        title: 'clean baseboards',
        description: 'Baseboards need to be dusted.',
        emoji:'🧼',
        points: 30,
        created_by: 2
      },{
        household_id: 1,
        title: 'mop floor',
        description: 'Mop the floor.',
        emoji:'🪣🧹',
        points: 40,
        created_by: 1
      },{
        household_id: 1,
        title: 'homework',
        description: 'Homework must be done every Friday.',
        emoji:'📃',
        points: 30,
        created_by: 1
      },{
        household_id: 1,
        title: 'take out trash',
        description: 'Take kitchen trash out.',
        emoji:'🗑️',
        points: 10,
        created_by: 2
      },{
        household_id: 1,
        title: 'clean bathroom',
        description: 'Your bathroom needs to be cleaned once a month.',
        emoji:'🧼🚽',
        points: 50,
        created_by: 2
      }
    ]);
};
