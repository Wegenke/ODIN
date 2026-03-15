const knex = require('../db')

const getChores = async (household_id) => {
  const chores = await knex('chores')
    .where({household_id})
    .select('*')
    .orderBy('id')

  const choreIds = chores.map(c => c.id)
  const schedules = await knex('chore_schedules')
    .whereIn('chore_id', choreIds)
    .where({ active: true })

  chores.forEach(c => {
    c.schedules = schedules.filter(s => s.chore_id === c.id)
  })

  return chores
}

const createChore = async (data) => {
  const [chore] = await knex('chores')
    .insert(data)
    .returning('*')
  return chore
}

const updateChore = async (id, household_id, data) => {
  const allowedFields = ['title','points','description', 'emoji']

  const updateFields = Object.fromEntries(
    Object.entries(data)
      .filter(([key,value])=> allowedFields.includes(key) && value !== undefined )
  )

  if (Object.keys(updateFields).length === 0) throw Object.assign(new Error('No valid fields to update'), {status: 400})


  const [updatedChore] = await knex('chores')
    .where({
      id,
      household_id
    })
    .update(updateFields)
    .returning('*')

  if (!updatedChore) throw Object.assign(new Error('Chore not found'), {status: 404})

  return updatedChore
}

module.exports = {getChores, createChore, updateChore}