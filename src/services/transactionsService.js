const knex = require('../db')

const getMyTransactions = async (child_id, {page=1, limit=20, source} = {}) => {
  const offset = (page - 1) * limit
  const query = knex('transactions')
    .where({child_id})

  if(source) query.andWhere({source})

  const [{count}] = await query.clone()
    .count('transactions.id as count')
  const total = parseInt(count)

  const data = await query
    .orderBy('created_at','desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination:{
      total,
      page,
      limit,
      totalPages: Math.ceil(total/limit)
    }
  }

}
const getTransactionsByChild = async (child_id, household_id, {page=1, limit=20, source} = {}) => {
  const offset = (page - 1) * limit
  const query = knex('transactions')
    .join('users', 'transactions.child_id', 'users.id')
    .where({'transactions.child_id':child_id, 'users.household_id':household_id})
    .select('transactions.*')

  if(source) query.andWhere({source})

  const [{count}] = await query.clone()
    .clearSelect()
    .count('transactions.id as count')
  const total = parseInt(count)

  const data = await query
    .orderBy('created_at','desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination:{
      total,
      page,
      limit,
      totalPages: Math.ceil(total/limit)
    }
  }

}
const getHouseholdTransactions = async (household_id, {page=1, limit=20, source} = {}) => {
  const offset = (page - 1) * limit
  const query = knex('transactions')
    .join('users', 'transactions.child_id', 'users.id')
    .where({'users.household_id':household_id})
    .select('transactions.*', 'users.name as child_name', 'users.avatar as child_avatar')

  if(source) query.andWhere({source})

  const [{count}] = await query.clone()
    .clearSelect()
    .count('transactions.id as count')
  const total = parseInt(count)

  const data = await query
    .orderBy('created_at','desc')
    .limit(limit)
    .offset(offset)

  return {
    data,
    pagination:{
      total,
      page,
      limit,
      totalPages: Math.ceil(total/limit)
    }
  }

}

module.exports = {getMyTransactions, getTransactionsByChild, getHouseholdTransactions}