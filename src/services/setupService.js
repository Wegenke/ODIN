const knex = require('../db')

async function getSetupStatus() {
  const [existingParent] = await knex('users').where({ role: 'parent' }).limit(1)
  return { complete: !!existingParent }
}

async function setup({ household_name, name, nick_name, avatar, pin_hash }) {
  return knex.transaction(async (trx) => {
    const [existingParent] = await trx('users').where({ role: 'parent' }).limit(1)
    if (existingParent) {
      const err = Object.assign(new Error('Setup already complete'), { status: 403 })
      throw err
    }

    let createdHousehold
    const [existingHousehold] = await trx('households').limit(1)
    if (existingHousehold) {
      createdHousehold = existingHousehold
    } else {
      ;[createdHousehold] = await trx('households').insert({ name: household_name }).returning('*')
    }

    const [user] = await trx('users')
      .insert({
        household_id: createdHousehold.id,
        name,
        nick_name,
        avatar,
        role: 'parent',
        pin_hash
      })
      .returning(['id', 'household_id', 'name', 'nick_name', 'avatar', 'role'])

    return { household:createdHousehold, user }
  })
}

module.exports = { getSetupStatus,  setup }
