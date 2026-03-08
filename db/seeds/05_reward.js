/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('rewards').insert([
    {
      household_id: 1,
      created_by: 4,
      name:"See movie",
      description: "See the movie 'Iron Lung' as a family",
      link: "https://www.imdb.com/title/tt27564844/",
      is_shared:true
    },{
      household_id: 1,
      created_by: 3,
      name:"Street Fighter 6",
      description: "Street Fighter 6 for PC",
      link: "https://store.steampowered.com/app/1364780/Street_Fighter_6/",
      status:'active'
    },{
      household_id: 1,
      created_by: 1,
      name:"Eat at favorite Restaurant",
      description: "Go out to eat at, Beast Burger",
      points_required: 300,
      is_shared:true,
      status:'funded'
    },{
      household_id: 1,
      created_by: 2,
      name:"Movie Night at Home",
      description: "Watch a movie as a family",
      points_required: 100,
      is_shared:true,
      status:'redeemed'
    },{
      household_id: 1,
      created_by: 4,
      name:"Nerf Blaster",
      description: "The new Nerf Blaster",
      is_shared:true,
      status:'archived'
    }

  ]);
};
