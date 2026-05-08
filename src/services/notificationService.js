const knex = require('../db')

const TYPES = [
  'chore_approved',
  'chore_rejected',
  'assignment_given',
  'reward_approved',
  'reward_rejected',
  'reward_funded',
  'reward_cancelled',
  'refund_approved',
  'refund_rejected',
  'bug_status_changed'
]

const create = async (data, trx = knex) => {
  const [row] = await trx('notifications').insert(data).returning('*')
  return row
}

const createMany = async (rows, trx = knex) => {
  if (rows.length === 0) return []
  return await trx('notifications').insert(rows).returning('*')
}

const getOwn = async (user_id, { unseen } = {}) => {
  const query = knex('notifications')
    .where({ user_id })
    .orderBy([
      { column: 'created_at', order: 'desc' },
      { column: 'id', order: 'desc' }
    ])
  if (unseen === true || unseen === 'true') query.whereNull('seen_at')
  return await query
}

const markAllSeen = async (user_id) => {
  const updated = await knex('notifications')
    .where({ user_id })
    .whereNull('seen_at')
    .update({ seen_at: knex.fn.now() })
  return updated
}

const markOneSeen = async (id, user_id) => {
  const notif = await knex('notifications').where({ id, user_id }).first()
  if (!notif) throw Object.assign(new Error('Notification not found'), { status: 404 })
  if (notif.seen_at) return notif
  const [updated] = await knex('notifications')
    .where({ id })
    .update({ seen_at: knex.fn.now() })
    .returning('*')
  return updated
}

const getUnseenCount = async (user_id) => {
  if (!user_id) return 0
  const result = await knex('notifications')
    .where({ user_id })
    .whereNull('seen_at')
    .count('* as count')
    .first()
  return parseInt(result.count) || 0
}

const pruneSeen = async (days = 7) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return await knex('notifications')
    .whereNotNull('seen_at')
    .where('seen_at', '<', cutoff)
    .del()
}

// Recipients for a reward becoming funded: every distinct contributor child,
// plus the reward creator if they are a child and not already in the set.
// Returns an array of user ids.
const getRewardFundedRecipients = async (reward_id, trx = knex) => {
  const reward = await trx('rewards').where({ id: reward_id }).first()
  if (!reward) return []

  const contributorIds = await trx('reward_contributions')
    .where({ reward_id })
    .distinct('child_id')
    .pluck('child_id')

  const recipients = new Set(contributorIds)
  const creator = await trx('users').where({ id: reward.created_by }).first()
  if (creator && creator.role === 'child') recipients.add(creator.id)

  return Array.from(recipients)
}

module.exports = {
  TYPES,
  create,
  createMany,
  getOwn,
  markAllSeen,
  markOneSeen,
  getUnseenCount,
  pruneSeen,
  getRewardFundedRecipients
}
