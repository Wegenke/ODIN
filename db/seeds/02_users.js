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
        name: 'Homer',
        nick_name: "HOMIE",
        avatar: {style:'pixel-art', seed:'Homer'},
        role: 'parent',
        pin_hash: parent1
      },{
        household_id: 1,
        name: 'Marge',
        avatar: {style:'pixel-art', seed:'Marge'},
        role: 'parent',
        pin_hash: parent2
      },{
        household_id: 1,
        name: 'Bart',
        nick_name: "BART MAN",
        avatar: {style:'pixel-art', seed:'Bart'},
        role: 'child',
        pin_hash: child1
      },{
        household_id: 1,
        name: 'Lisa',
        avatar: {style:'pixel-art', seed:'Lisa'},
        role: 'child',
        pin_hash: child2
      }
    ]);
};
