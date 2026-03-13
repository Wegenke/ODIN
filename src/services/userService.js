const knex = require('../db')

const getUsers = async (household_id) => {
  return await knex('users')
  .where({household_id})
  .where(q => q.whereNot({ status: 'inactive' }).orWhereNull('status'))
  .select('id','name','nick_name','avatar','role')
  .orderBy('id')
}

const getUserById = async (id, household_id) => {
  return await knex('users')
  .where({
    id,
    household_id
  })
  .select('id','name','nick_name','avatar','role','points_balance')
  .first()
}

const getUserTransactions = async (child_id,household_id) => {
  return await knex('transactions')
    .join('users', 'transactions.child_id', 'users.id')
    .where({'transactions.child_id': child_id, 'users.household_id': household_id})
    .select('transactions.*')
    .orderBy('transactions.created_at', 'desc')
}

const createUser = async (data) => {
  const [user] = await knex('users')
    .insert(data)
    .returning('*')
  return user
}

const getRecentPinChanges = async (household_id) => {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  return await knex('users')
    .where({household_id})
    .where('pin_last_changed', '>=', fiveDaysAgo)
    .select('id', 'name', 'nick_name', 'avatar', 'pin_last_changed')
    .orderBy('pin_last_changed', 'desc')
}

const updateUser = async (id,household_id,data) => {
  const allowedFields = ['name','nick_name','avatar','role','pin_hash','pin_last_changed']

  const updateFields = Object.fromEntries(
    Object.entries(data)
      .filter(([key,value])=> allowedFields.includes(key) && value !== undefined )
  )

  if (Object.keys(updateFields).length === 0) throw Object.assign(new Error('No valid fields to update'), {status: 400})

  const [updatedUser] = await knex('users')
    .where({
      id,
      household_id
    })
    .update(updateFields)
    .returning('*')

  if (!updatedUser) throw Object.assign(new Error('User not found'), {status: 404})

  return updatedUser
}

const updateMe = async (id,data) => {

  const allowedFields = ['nick_name','avatar','pin_hash','pin_last_changed']

  const updateFields = Object.fromEntries(
    Object.entries(data)
      .filter(([key,value])=> allowedFields.includes(key) && value !== undefined )
  )

  if (Object.keys(updateFields).length === 0) throw Object.assign(new Error('No valid fields to update'), {status: 400})

  const [updatedUser] = await knex('users')
    .where({id})
    .update(updateFields)
    .returning('*')

  if (!updatedUser) throw Object.assign(new Error('User not found'), {status: 404})

  return updatedUser
}

const deactivateUser = async (id, household_id) => {
  const [user] = await knex('users')
    .where({ id, household_id, role: 'child' })
    .update({ status: 'inactive' })
    .returning('id')

  if (!user) throw Object.assign(new Error('User not found or cannot be deactivated'), { status: 404 })
  return user
}

module.exports = {getUsers, getUserById, getUserTransactions, createUser, getRecentPinChanges, updateUser, updateMe, deactivateUser}