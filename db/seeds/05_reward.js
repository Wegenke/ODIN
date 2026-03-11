/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('rewards').insert([
    { // 1 — pending (no points_required yet)
      household_id: 1,
      created_by: 4,
      name: 'See movie',
      description: 'See the movie Iron Lung as a family',
      link: 'https://www.imdb.com/title/tt27564844/',
      is_shared: true
    },{ // 2 — active (partially funded)
      household_id: 1,
      created_by: 4,
      name: 'Street Fighter 5',
      description: 'Street Fighter 6 for PC',
      link: 'https://store.steampowered.com/app/1364780/Street_Fighter_5/',
      points_required: 100,
      status: 'active'
    },{ // 2 — active (partially funded)
      household_id: 1,
      created_by: 3,
      name: 'Street Fighter 6',
      description: 'Street Fighter 6 for PC',
      link: 'https://store.steampowered.com/app/1364780/Street_Fighter_6/',
      points_required: 100,
      status: 'active'
    },{ // 3 — funded
      household_id: 1,
      created_by: 1,
      name: 'Eat at Beast Burger',
      description: 'Go out to eat at Beast Burger',
      points_required: 40,
      is_shared: true,
      status: 'funded'
    },{ // 4 — redeemed
      household_id: 1,
      created_by: 2,
      name: 'Movie Night at Home',
      description: 'Watch a movie as a family',
      points_required: 30,
      is_shared: true,
      status: 'redeemed'
    },{ // 5 — archived
      household_id: 1,
      created_by: 4,
      name: 'Nerf Blaster',
      description: 'The new Nerf Blaster',
      points_required: 150,
      is_shared: false,
      status: 'archived'
    }
  ])
}
