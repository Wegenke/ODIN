const knex = require('../db')

const TERMINAL_STATES = ['approved', 'dismissed', 'canceled']

const createSchedule = async (data, household_id) => {
  const chore = await knex('chores').where({ id: data.chore_id, household_id }).first()
  if (!chore) throw Object.assign(new Error('Chore not found'), { status: 404 })

  const child = await knex('users').where({ id: data.child_id, household_id }).first()
  if (!child || child.role !== 'child') throw Object.assign(new Error('User is not a child'), { status: 400 })

  const existingQuery = { chore_id: data.chore_id, child_id: data.child_id, frequency: data.frequency }
  if (data.day_of_week != null) existingQuery.day_of_week = data.day_of_week
  if (data.day_of_month != null) existingQuery.day_of_month = data.day_of_month
  const existing = await knex('chore_schedules').where(existingQuery).first()
  if (existing) throw Object.assign(new Error('Schedule already exists for this day'), { status: 409 })

  const [schedule] = await knex('chore_schedules')
    .insert({
      chore_id: data.chore_id,
      child_id: data.child_id,
      frequency: data.frequency,
      day_of_week: data.day_of_week != null ? data.day_of_week : null,
      day_of_month: data.day_of_month != null ? data.day_of_month : null,
      last_generated_at: knex.fn.now()
    })
    .returning('*')

  const activeAssignment = await knex('chore_assignments')
    .where({ chore_id: data.chore_id, child_id: data.child_id })
    .whereNotIn('status', TERMINAL_STATES)
    .first()

  let assignment = null
  if (!activeAssignment) {
    const [created] = await knex('chore_assignments')
      .insert({ chore_id: data.chore_id, child_id: data.child_id, status: 'assigned' })
      .returning('*')
    assignment = created
  }

  return { schedule, assignment }
}

const getSchedulesByHousehold = async (household_id) => {
  return knex('chore_schedules')
    .join('chores', 'chore_schedules.chore_id', 'chores.id')
    .where({ 'chores.household_id': household_id })
    .select('chore_schedules.*')
}

const getSchedulesByChore = async (chore_id, household_id) => {
  return knex('chore_schedules')
    .join('chores', 'chore_schedules.chore_id', 'chores.id')
    .where({ 'chore_schedules.chore_id': chore_id, 'chores.household_id': household_id })
    .select('chore_schedules.*')
}

const updateSchedule = async (id, data, household_id) => {
  const schedule = await knex('chore_schedules')
    .join('chores', 'chore_schedules.chore_id', 'chores.id')
    .where({ 'chore_schedules.id': id, 'chores.household_id': household_id })
    .select('chore_schedules.*')
    .first()
  if (!schedule) throw Object.assign(new Error('Schedule not found'), { status: 404 })

  const [updated] = await knex('chore_schedules')
    .where({ id })
    .update(data)
    .returning('*')
  return updated
}

const deleteSchedule = async (id, household_id) => {
  const schedule = await knex('chore_schedules')
    .join('chores', 'chore_schedules.chore_id', 'chores.id')
    .where({ 'chore_schedules.id': id, 'chores.household_id': household_id })
    .select('chore_schedules.*')
    .first()
  if (!schedule) throw Object.assign(new Error('Schedule not found'), { status: 404 })

  await knex('chore_schedules').where({ id }).del()
  return schedule
}

module.exports = { createSchedule, getSchedulesByHousehold, getSchedulesByChore, updateSchedule, deleteSchedule, TERMINAL_STATES }
