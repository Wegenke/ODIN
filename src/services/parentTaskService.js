const knex = require('../db')

const getTasks = async (household_id) => {
  return knex('parent_tasks')
    .where({ household_id })
    .whereNot({ status: 'archived' })
    .orderBy('sort_order')
}

const getRecentlyCompleted = async (household_id) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  return knex('parent_tasks')
    .where({ household_id, status: 'archived' })
    .where('archived_at', '>=', threeDaysAgo)
    .orderBy('archived_at', 'desc')
}

const createTask = async (data, household_id, created_by) => {
  const maxOrder = await knex('parent_tasks')
    .where({ household_id })
    .whereNot({ status: 'archived' })
    .max('sort_order as max')
    .first()

  const [task] = await knex('parent_tasks')
    .insert({
      household_id,
      created_by,
      title: data.title,
      status: 'active',
      sort_order: (maxOrder?.max ?? 0) + 10
    })
    .returning('*')

  return task
}

const updateTask = async (id, data, household_id) => {
  const task = await knex('parent_tasks').where({ id, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  const [updated] = await knex('parent_tasks')
    .where({ id })
    .update({ ...data, updated_at: knex.fn.now() })
    .returning('*')

  return updated
}

const startTask = async (id, household_id, started_by) => {
  const task = await knex('parent_tasks').where({ id, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  const [updated] = await knex('parent_tasks')
    .where({ id })
    .update({ status: 'working', started_by, updated_at: knex.fn.now() })
    .returning('*')

  return updated
}

const pauseTask = async (id, household_id) => {
  const task = await knex('parent_tasks').where({ id, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  const [updated] = await knex('parent_tasks')
    .where({ id })
    .update({ status: 'active', started_by: null, updated_at: knex.fn.now() })
    .returning('*')

  return updated
}

const archiveTask = async (id, household_id) => {
  const task = await knex('parent_tasks').where({ id, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  const [updated] = await knex('parent_tasks')
    .where({ id })
    .update({ status: 'archived', archived_at: knex.fn.now(), updated_at: knex.fn.now() })
    .returning('*')

  return updated
}

const reorderTasks = async (ids, household_id) => {
  await knex.transaction(async (trx) => {
    for (let i = 0; i < ids.length; i++) {
      await trx('parent_tasks')
        .where({ id: ids[i], household_id })
        .update({ sort_order: (i + 1) * 10 })
    }
  })
}

const getNotes = async (taskId, household_id) => {
  const task = await knex('parent_tasks').where({ id: taskId, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  return knex('parent_task_notes')
    .join('users', 'parent_task_notes.created_by', 'users.id')
    .where({ parent_task_id: taskId })
    .select('parent_task_notes.*', 'users.name as author_name', 'users.nick_name as author_nick_name')
    .orderBy('parent_task_notes.created_at', 'desc')
}

const addNote = async (taskId, content, household_id, created_by) => {
  const task = await knex('parent_tasks').where({ id: taskId, household_id }).first()
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 })

  const [note] = await knex('parent_task_notes')
    .insert({ parent_task_id: taskId, created_by, content })
    .returning('*')

  return note
}

module.exports = { getTasks, getRecentlyCompleted, createTask, updateTask, startTask, pauseTask, archiveTask, reorderTasks, getNotes, addNote }
