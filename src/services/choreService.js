const knex = require('../db')

const getChores = async (household_id) => {
  return await knex('chores')
  .where({household_id})
  .select('*')
  .orderBy('id')
}

const createChore = async (data) => {
  const [chore] = await knex('chores')
    .insert(data)
    .returning('*')
  return chore
}

const updateChore = async (id, household_id, data) => {
  const allowedFields = ['title','points','description','recurrence_rule']

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