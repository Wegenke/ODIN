const knex = require('../db')

const getMyTransactions = async (child_id, { page = 1, limit = 20, source } = {}) => {
  const offset = (page - 1) * limit
  const query = knex('transactions')
    .where({ 'transactions.child_id': child_id })
    .leftJoin('chore_assignments', function () {
      this.on('transactions.reference_id', 'chore_assignments.id')
        .andOn(knex.raw("transactions.source = 'chore_approved'"))
    })
    .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
    .leftJoin('rewards', function () {
      this.on('transactions.reference_id', 'rewards.id')
        .andOnIn('transactions.source', ['reward_contribution', 'reward_refund'])
    })
    .leftJoin('point_adjustments', function () {
      this.on('transactions.reference_id', 'point_adjustments.id')
        .andOnIn('transactions.source', ['adjustment_reward', 'adjustment_penalty'])
    })
    .select('transactions.*', knex.raw("COALESCE(chores.title, rewards.name, point_adjustments.reason) as reference_title"))

  if (source) query.andWhere({ source })

  const [{ count }] = await query.clone()
    .clearSelect()
    .count('transactions.id as count')

  const total = parseInt(count)

  const data = await query
    .orderBy('transactions.created_at', 'desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

}
const getTransactionsByChild = async (child_id, household_id, { page = 1, limit = 20, source } = {}) => {
  const offset = (page - 1) * limit
  const query = knex('transactions')
    .join('users', 'transactions.child_id', 'users.id')
    .where({ 'transactions.child_id': child_id, 'users.household_id': household_id })
    .leftJoin('chore_assignments', function () {
      this.on('transactions.reference_id', 'chore_assignments.id')
        .andOn(knex.raw("transactions.source = 'chore_approved'"))
    })
    .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
    .leftJoin('rewards', function () {
      this.on('transactions.reference_id', 'rewards.id')
        .andOnIn('transactions.source', ['reward_contribution', 'reward_refund'])
    })
    .leftJoin('point_adjustments', function () {
      this.on('transactions.reference_id', 'point_adjustments.id')
        .andOnIn('transactions.source', ['adjustment_reward', 'adjustment_penalty'])
    })
    .select('transactions.*', knex.raw("COALESCE(chores.title, rewards.name, point_adjustments.reason) as reference_title"))

  if (source) query.andWhere({ source })

  const [{ count }] = await query.clone()
    .clearSelect()
    .count('transactions.id as count')
  const total = parseInt(count)

  const data = await query
    .orderBy('transactions.created_at', 'desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

}
const getHouseholdTransactions = async (household_id, { page = 1, limit = 20, source } = {}) => {
  const offset = (page -1) * limit
  const query = knex('transactions')
    .join('users', 'transactions.child_id', 'users.id')
    .where({ 'users.household_id': household_id })
    .leftJoin('chore_assignments', function () {
      this.on('transactions.reference_id', 'chore_assignments.id')
        .andOn(knex.raw("transactions.source = 'chore_approved'"))
    })
    .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
    .leftJoin('rewards', function () {
      this.on('transactions.reference_id', 'rewards.id')
        .andOnIn('transactions.source', ['reward_contribution', 'reward_refund'])
    })
    .leftJoin('point_adjustments', function () {
      this.on('transactions.reference_id', 'point_adjustments.id')
        .andOnIn('transactions.source', ['adjustment_reward', 'adjustment_penalty'])
    })
    .select(
      'transactions.*',
      'users.name as child_name',
      'users.avatar as child_avatar',
      knex.raw("COALESCE(chores.title, rewards.name, point_adjustments.reason) as reference_title")
    )


  if (source) query.andWhere({ source })

  const [{ count }] = await query.clone()
    .clearSelect()
    .count('transactions.id as count')
  const total = parseInt(count)

  const data = await query
    .orderBy('transactions.created_at', 'desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

}

module.exports = { getMyTransactions, getTransactionsByChild, getHouseholdTransactions }