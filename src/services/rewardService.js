const knex = require('../db')
const notificationService = require('./notificationService')

const notifyFunded = async (reward, trx) => {
  const recipients = await notificationService.getRewardFundedRecipients(reward.id, trx)
  if (recipients.length === 0) return
  const rows = recipients.map(user_id => ({
    household_id: reward.household_id,
    user_id,
    type: 'reward_funded',
    reference_id: reward.id
  }))
  await notificationService.createMany(rows, trx)
}

const getRewards = async (household_id, {status, sort} = {}) => {
  const query = knex('rewards')
    .where({ household_id })

  if(status) query.andWhere({status})

  if(sort === 'progress'){
    query
      .leftJoin('reward_contributions','rewards.id','reward_contributions.reward_id')
      .select('rewards.*', knex.raw('COALESCE(SUM(reward_contributions.points), 0) as contributed_total'))
      .groupBy('rewards.id')
      .orderByRaw('(rewards.points_required - COALESCE(SUM(reward_contributions.points), 0)) ASC NULLS LAST')
  }else{
    query.orderBy('created_at', 'desc')
  }

  return await query
}

const getRewardById = async (id, household_id) => {
  const reward = await knex('rewards')
    .where({ id, household_id })
    .first()
  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  return reward
}

const createReward = async (household_id, user_id, role, data) => {
  const { points_required, ...safeData } = data
  const isParent = role === 'parent'
  const status = isParent && points_required ? 'active' : 'pending'

  const [reward] = await knex('rewards')
    .insert({
      ...safeData,
      household_id,
      created_by: user_id,
      status,
      ...(isParent && points_required ? { points_required } : {})
    })
    .returning('*')

  return reward
}

const updateReward = async (id, household_id, data) => {
  const allowedFields = ['name', 'description', 'link', 'points_required', 'is_shared']

  const updateFields = Object.fromEntries(
    Object.entries(data)
      .filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
  )

  if (Object.keys(updateFields).length === 0) throw Object.assign(new Error('No valid fields to update'), {status: 400})

  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})

    await trx('rewards')
      .where({ id, household_id })
      .update(updateFields)

    if (updateFields.points_required !== undefined && (reward.status === 'active' || reward.status === 'funded')) {
      const { sum } = await trx('reward_contributions')
        .where({ reward_id: id })
        .sum('points as sum')
        .first()
      const contributed = parseInt(sum) || 0
      const newStatus = contributed >= updateFields.points_required ? 'funded' : 'active'

      if (newStatus !== reward.status) {
        await trx('rewards')
          .where({ id, household_id })
          .update({ status: newStatus })
        if (newStatus === 'funded') {
          await notifyFunded({ id, household_id }, trx)
        }
      }
    }

    return await trx('rewards')
      .where({ id, household_id })
      .first()
  })
}

const approveReward = async (id, household_id, points_required) => {
  const reward = await knex('rewards')
    .where({ id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  if (reward.status !== 'pending') throw Object.assign(new Error('Reward not pending'), {status: 400})

  const [updatedReward] = await knex('rewards')
    .where({ id, household_id })
    .update({
      points_required,
      status: 'active'
    })
    .returning('*')

  await notificationService.create({
    household_id,
    user_id: reward.created_by,
    type: 'reward_approved',
    reference_id: reward.id
  })

  return updatedReward
}

const rejectReward = async (id, household_id) => {
  const reward = await knex('rewards')
    .where({ id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  if (reward.status !== 'pending') throw Object.assign(new Error('Reward not pending'), {status: 400})

  const [updatedReward] = await knex('rewards')
    .where({ id, household_id })
    .update({ status: 'archived' })
    .returning('*')

  await notificationService.create({
    household_id,
    user_id: reward.created_by,
    type: 'reward_rejected',
    reference_id: reward.id
  })

  return updatedReward
}

const setRewardFunded = async (id, household_id) => {
  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
    if (reward.status !== 'active') throw Object.assign(new Error('Reward not active'), {status: 400})

    const [updatedReward] = await trx('rewards')
      .where({ id, household_id })
      .update({ status: 'funded' })
      .returning('*')

    await notifyFunded(updatedReward, trx)

    return updatedReward
  })
}

const contributeToReward = async (reward_id, child_id, household_id, requested_points) => {
  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id: reward_id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error("Reward not found"), {status: 404})
    if (reward.status !== 'active') throw Object.assign(new Error("Reward not accepting contributions"), {status: 400})

    const { sum } = await trx('reward_contributions')
      .where({ reward_id })
      .sum('points as sum')
      .first()

    const contributed_total = parseInt(sum) || 0
    const remaining = reward.points_required - contributed_total

    const child = await trx('users')
      .where({ id: child_id })
      .forUpdate()
      .first()

    const actual = Math.min(requested_points, remaining, child.points_balance)

    if (remaining <= 0) throw Object.assign(new Error('Reward is already fully funded'), {status: 400})
    if (actual <= 0) throw Object.assign(new Error('Insufficient points balance'), {status: 400})

    const [contribution] = await trx('reward_contributions')
      .insert({
        reward_id,
        child_id, points: actual
      })
      .returning('*')

    await trx('transactions')
      .insert({
        child_id,
        amount: -actual,
        source: 'reward_contribution',
        reference_id: reward_id
      })

    await trx('users')
      .where({ id: child_id })
      .decrement('points_balance', actual)

    if (contributed_total + actual >= reward.points_required) {
      await trx('rewards')
        .where({ id: reward_id })
        .update({ status: 'funded' })
      await notifyFunded({ id: reward_id, household_id }, trx)
    }
    return contribution
  })
}

const getRewardProgress = async (reward_id, household_id) => {
  const reward = await knex('rewards')
    .where({ id: reward_id, household_id })
    .first()
  if (!reward) throw Object.assign(new Error("Reward not found"), {status: 404})
  if (reward.status === 'pending') throw Object.assign(new Error("Reward pending approval"), {status: 400})

  const contributions = await knex('reward_contributions')
    .join('users', 'reward_contributions.child_id', 'users.id')
    .where({ reward_id })
    .select(
      'users.id as child_id',
      'users.name',
      'users.avatar',
      knex.raw('Sum(reward_contributions.points) as points')
    )
    .groupBy('users.id', 'users.name', 'users.avatar')

  return { reward, contributions }
}

const redeemReward = async (id, household_id) => {
  const reward = await knex('rewards')
    .where({ id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  if (reward.status !== 'funded') throw Object.assign(new Error('Reward not funded'), {status: 400})

  const [fundedReward] = await knex('rewards')
    .where({ id, household_id })
    .update({
      status: 'redeemed'
    })
    .returning('*')

  return fundedReward
}

const archiveReward = async (id, household_id) => {
  const reward = await knex('rewards')
    .where({ id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  if (reward.status !== 'redeemed') throw Object.assign(new Error('Reward not redeemed'), {status: 400})

  const [updatedReward] = await knex('rewards')
    .where({ id, household_id })
    .update({ status: 'archived' })
    .returning('*')

  return updatedReward
}

const cancelReward = async (id, household_id) => {
  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
    if (reward.status !== 'active') throw Object.assign(new Error('Reward not active'), {status: 400})

    const contributions = await trx('reward_contributions')
      .where({ reward_id: id })

    const sumByChild = new Map()
    for (const c of contributions) {
      sumByChild.set(c.child_id, (sumByChild.get(c.child_id) || 0) + c.points)
    }

    for (const [child_id, points] of sumByChild) {
      await trx('transactions').insert({
        child_id,
        amount: points,
        source: 'reward_refund',
        reference_id: id
      })
      await trx('users')
        .where({ id: child_id })
        .increment('points_balance', points)
    }

    await trx('reward_contributions').where({ reward_id: id }).del()

    const [updatedReward] = await trx('rewards')
      .where({ id, household_id })
      .update({ status: 'archived' })
      .returning('*')

    if (sumByChild.size > 0) {
      const rows = Array.from(sumByChild.keys()).map(user_id => ({
        household_id,
        user_id,
        type: 'reward_cancelled',
        reference_id: id
      }))
      await notificationService.createMany(rows, trx)
    }

    return updatedReward
  })
}

const refundAllContributions = async (id, household_id) => {
  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
    if (reward.status !== 'active' && reward.status !== 'funded') {
      throw Object.assign(new Error('Reward not eligible for refund'), {status: 400})
    }

    const contributions = await trx('reward_contributions')
      .where({ reward_id: id })

    const sumByChild = new Map()
    for (const c of contributions) {
      sumByChild.set(c.child_id, (sumByChild.get(c.child_id) || 0) + c.points)
    }

    let totalRefunded = 0
    for (const [child_id, points] of sumByChild) {
      await trx('transactions').insert({
        child_id,
        amount: points,
        source: 'reward_refund',
        reference_id: id
      })
      await trx('users')
        .where({ id: child_id })
        .increment('points_balance', points)
      totalRefunded += points
    }

    await trx('reward_contributions').where({ reward_id: id }).del()

    const [updatedReward] = await trx('rewards')
      .where({ id, household_id })
      .update({ status: 'active' })
      .returning('*')

    return { reward: updatedReward, refunded_points: totalRefunded, refunded_children: sumByChild.size }
  })
}

const requestContributionRefund = async (reward_id, child_id, household_id) => {
  const reward = await knex('rewards')
    .where({ id: reward_id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})
  if (reward.status !== 'active' && reward.status !== 'funded') throw Object.assign(new Error('Reward not eligible for refund'), {status: 400})

  const contributions = await knex('reward_contributions')
    .where({ reward_id, child_id })

  if (contributions.length === 0) throw Object.assign(new Error('No contributions found'), {status: 404})
  if (contributions.some(c => c.refund_requested)) throw Object.assign(new Error('Refund already requested'), {status: 400})

  await knex('reward_contributions')
    .where({ reward_id, child_id })
    .update({ refund_requested: true })

  return contributions
}

const approveContributionRefund = async (reward_id, child_id, household_id) => {
  return await knex.transaction(async trx => {
    const reward = await trx('rewards')
      .where({ id: reward_id, household_id })
      .forUpdate()
      .first()

    if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})

    const contributions = await trx('reward_contributions')
      .where({ reward_id, child_id, refund_requested: true })

    if (contributions.length === 0) throw Object.assign(new Error('No refund requested'), {status: 400})

    const totalRefund = contributions.reduce((sum, c) => sum + c.points, 0)

    await trx('transactions')
      .insert({
        child_id,
        amount: totalRefund,
        source: 'reward_refund',
        reference_id: reward_id
      })

    await trx('users')
      .where({ id: child_id })
      .increment('points_balance', totalRefund)

    await trx('reward_contributions')
      .where({ reward_id, child_id })
      .del()

    const { sum } = await trx('reward_contributions')
      .where({ reward_id })
      .sum('points as sum')
      .first()
    const remainingTotal = parseInt(sum) || 0

    const newStatus = (reward.status === 'funded' && remainingTotal < reward.points_required) ? 'active' : reward.status

    if(newStatus !== reward.status){
      await trx('rewards')
        .where({ id: reward_id })
        .update({ status: newStatus})
    }

    await notificationService.create({
      household_id,
      user_id: child_id,
      type: 'refund_approved',
      reference_id: reward_id
    }, trx)

    return { refunded_points: totalRefund, reward_status: newStatus }
  })
}

const rejectContributionRefund = async (reward_id, child_id, household_id) => {
  const reward = await knex('rewards')
    .where({ id: reward_id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})

  const updated = await knex('reward_contributions')
    .where({ reward_id, child_id, refund_requested: true })
    .update({ refund_requested: false })
    .returning('*')

  if (updated.length === 0) throw Object.assign(new Error('No refund to reject'), {status: 400})

  await notificationService.create({
    household_id,
    user_id: child_id,
    type: 'refund_rejected',
    reference_id: reward_id
  })

  return updated
}

const cancelContributionRefund = async (reward_id, child_id, household_id) => {
  const reward = await knex('rewards')
    .where({ id: reward_id, household_id })
    .first()

  if (!reward) throw Object.assign(new Error('Reward not found'), {status: 404})

  const updated = await knex('reward_contributions')
    .where({ reward_id, child_id, refund_requested: true })
    .update({ refund_requested: false })
    .returning('*')

  if (updated.length === 0) throw Object.assign(new Error('No refund to cancel'), {status: 400})

  return updated
}

const getRefundRequests = async (household_id) => {
  return await knex('reward_contributions')
    .join('rewards', 'reward_contributions.reward_id', 'rewards.id')
    .join('users', 'reward_contributions.child_id', 'users.id')
    .where({
      'rewards.household_id':household_id,
      'reward_contributions.refund_requested':true
    })
    .select(
      'reward_contributions.id',
      'reward_contributions.points',
      'reward_contributions.created_at',
      'rewards.id as reward_id',
      'rewards.name as reward_name',
      'users.id as child_id',
      'users.name as child_name',
      'users.avatar as child_avatar'
    )
    .orderBy('reward_contributions.created_at', 'asc')
}

module.exports = { getRewards, getRewardById, createReward, updateReward, contributeToReward, getRewardProgress, redeemReward, approveReward, rejectReward, setRewardFunded, archiveReward, cancelReward, refundAllContributions, requestContributionRefund, approveContributionRefund, rejectContributionRefund, cancelContributionRefund, getRefundRequests}