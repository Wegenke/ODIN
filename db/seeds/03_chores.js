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
        points:1,
        recurrence_rule:"daily",
        created_by:1
      },{
        household_id: 1,
        title: 'dog poop',
        description: "Dog poo must be cleaned up every Thursday.",
        points:10,
        recurrence_rule:"weekly",
        created_by:1
      },{
        household_id: 1,
        title: 'do dishes',
        description: "Dishwasher needs to be unloaded and loaded daily",
        points:2,
        recurrence_rule:"daily",
        created_by:2
      },{
        household_id: 1,
        title: 'clean baseboards',
        description: "Baseboards need to be dusted/.",
        points:1,
        recurrence_rule:null,
        created_by:2
      },{
        household_id: 1,
        title: 'mop floor',
        description: "Mop the floor.",
        points:5,
        recurrence_rule:null,
        created_by:1
      },{
        household_id: 1,
        title: 'homework',
        description: "Home work must be done every Friday.",
        points:3,
        recurrence_rule:"weekly",
        created_by:1
      },{
        household_id: 1,
        title: 'take out trash',
        description: "Take kitchen trash out",
        points:2,
        recurrence_rule:"daily",
        created_by:2
      },{
        household_id: 1,
        title: 'clean bathroom',
        description: "Your bathroom needs to be cleaned once a month.",
        points:15,
        recurrence_rule:"monthly",
        created_by:2
      }
    ]);
};
