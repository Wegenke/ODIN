const knex = require('../db')

const verifyRewardInHousehold = async (reward_id, household_id) => {
  const reward = await knex('rewards').where({ id: reward_id, household_id }).first()
  if (!reward) throw Object.assign(new Error('Reward not found'), { status: 404 })
  return reward
}

const getNotes = async (reward_id, household_id) => {
  await verifyRewardInHousehold(reward_id, household_id)

  return knex('reward_notes')
    .join('users', 'reward_notes.created_by', 'users.id')
    .where({ reward_id })
    .select(
      'reward_notes.id',
      'reward_notes.reward_id',
      'reward_notes.created_by',
      'reward_notes.body',
      'reward_notes.created_at',
      'reward_notes.updated_at',
      'users.name as author_name',
      'users.nick_name as author_nick_name',
      'users.avatar as author_avatar'
    )
    .orderBy('reward_notes.created_at', 'desc')
}

const addNote = async (reward_id, body, household_id, created_by) => {
  await verifyRewardInHousehold(reward_id, household_id)

  const [note] = await knex('reward_notes')
    .insert({ reward_id, created_by, body })
    .returning('*')
  return note
}

const updateNote = async (id, body, household_id) => {
  const note = await knex('reward_notes')
    .join('rewards', 'reward_notes.reward_id', 'rewards.id')
    .where({ 'reward_notes.id': id, 'rewards.household_id': household_id })
    .select('reward_notes.*')
    .first()
  if (!note) throw Object.assign(new Error('Note not found'), { status: 404 })

  const [updated] = await knex('reward_notes')
    .where({ id })
    .update({ body, updated_at: knex.fn.now() })
    .returning('*')
  return updated
}

const deleteNote = async (id, household_id) => {
  const note = await knex('reward_notes')
    .join('rewards', 'reward_notes.reward_id', 'rewards.id')
    .where({ 'reward_notes.id': id, 'rewards.household_id': household_id })
    .select('reward_notes.*')
    .first()
  if (!note) throw Object.assign(new Error('Note not found'), { status: 404 })

  await knex('reward_notes').where({ id }).del()
}

module.exports = { getNotes, addNote, updateNote, deleteNote }
