const knex = require('../db')

const createAdjustment = async (data, household_id, parent_id) => {
  const child = await knex('users').where({ id: data.child_id, household_id, role: 'child' }).first()
  if (!child) throw Object.assign(new Error('Child not found'), { status: 404 })

  // Clamp deductions so balance doesn't go negative
  let adjustedPoints = data.points
  if (adjustedPoints < 0 && child.points_balance + adjustedPoints < 0) {
    adjustedPoints = -child.points_balance
    if (adjustedPoints === 0) throw Object.assign(new Error('Child has no points to deduct'), { status: 400 })
  }

  return await knex.transaction(async (trx) => {
    const [adjustment] = await trx('point_adjustments')
      .insert({
        household_id,
        child_id: data.child_id,
        parent_id,
        points: adjustedPoints,
        reason: data.reason
      })
      .returning('*')

    if (adjustedPoints > 0) {
      await trx('users').where({ id: data.child_id }).increment('points_balance', adjustedPoints)
    } else {
      await trx('users').where({ id: data.child_id }).decrement('points_balance', Math.abs(adjustedPoints))
    }

    const source = adjustedPoints > 0 ? 'adjustment_reward' : 'adjustment_penalty'
    await trx('transactions')
      .insert({
        child_id: data.child_id,
        amount: adjustedPoints,
        source,
        reference_id: adjustment.id,
        created_at: knex.fn.now()
      })

    return adjustment
  })
}

const getUnseenAdjustments = async (child_id) => {
  return knex('point_adjustments')
    .join('users', 'point_adjustments.parent_id', 'users.id')
    .where({ 'point_adjustments.child_id': child_id, seen: false })
    .select(
      'point_adjustments.*',
      'users.name as parent_name',
      'users.nick_name as parent_nick_name'
    )
    .orderBy('point_adjustments.created_at', 'desc')
}

const markSeen = async (id, child_id) => {
  const adjustment = await knex('point_adjustments').where({ id, child_id }).first()
  if (!adjustment) throw Object.assign(new Error('Adjustment not found'), { status: 404 })

  await knex('point_adjustments').where({ id }).update({ seen: true })
}

const markAllSeen = async (child_id) => {
  await knex('point_adjustments').where({ child_id, seen: false }).update({ seen: true })
}

module.exports = { createAdjustment, getUnseenAdjustments, markSeen, markAllSeen }
