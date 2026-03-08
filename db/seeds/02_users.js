const bcrypt = require('bcrypt')
const saltRounds = 10

const hash = (pin) => bcrypt.hash(pin, saltRounds)

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function(knex) {

  const [parent1, parent2, child1, child2] = await Promise.all([
    hash('1234'),
    hash('4321'),
    hash('9876'),
    hash('6789')
  ])

  await knex('users')
    .insert([
      {
        household_id: 1,
        name: 'Father',
        nick_name: "POPS",
        avatar: 'green slug',
        role: 'parent',
        pin_hash: parent1
      },{
        household_id: 1,
        name: 'Mother',
        nick_name: "MAMMA",
        avatar: 'red rose',
        role: 'parent',
        pin_hash: parent2
      },{
        household_id: 1,
        name: 'Eldest',
        nick_name: "BUBBA",
        avatar: 'blue snail',
        role: 'child',
        pin_hash: child1
      },{
        household_id: 1,
        name: 'Youngest',
        nick_name: "BIG GUY",
        avatar: 'pink eye',
        role: 'child',
        pin_hash: child2
      }
    ]);
};
