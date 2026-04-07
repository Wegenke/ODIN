const knex = require('../db')

const getParentDashboard = async (household_id) => {
  const [children, submittedAssignments, pendingRewards, refundRequests, unassignedAssignments, assignmentCounts] = await Promise.all([
    knex('users')
      .where({ household_id, role: 'child' })
      .where(q => q.whereNot({ status: 'inactive' }).orWhereNull('status'))
      .select('id', 'name', 'nick_name', 'avatar', 'points_balance'),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .join('users', 'chore_assignments.child_id', 'users.id')
      .where({
        'chore_assignments.status': 'submitted',
        'chores.household_id': household_id
      })
      .select(
        'chore_assignments.id',
        'chore_assignments.submitted_at',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points',
        'users.id as child_id',
        'users.name as child_name',
        'users.avatar as child_avatar'
      ),

    knex('rewards')
      .join('users', 'rewards.created_by', 'users.id')
      .where({
        'rewards.household_id': household_id,
        'rewards.status': 'pending'
      })
      .select(
        'rewards.id',
        'rewards.name',
        'rewards.description',
        'rewards.created_at',
        'users.name as created_by_name',
        'users.avatar as created_by_avatar'
      ),

    knex('reward_contributions')
      .join('rewards', 'reward_contributions.reward_id', 'rewards.id')
      .join('users', 'reward_contributions.child_id', 'users.id')
      .where({
        'rewards.household_id': household_id,
        'reward_contributions.refund_requested': true
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
      .orderBy('reward_contributions.created_at', 'asc'),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({
        'chore_assignments.status': 'unassigned',
        'chores.household_id': household_id
      })
      .select(
        'chore_assignments.id',
        'chore_assignments.assigned_at',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points'
      ),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({ 'chores.household_id': household_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .groupBy('chore_assignments.child_id', 'chore_assignments.status')
      .select('chore_assignments.child_id', 'chore_assignments.status', knex.raw('COUNT(*) as count'))
  ])

  const countsByChild = {}
  for (const row of assignmentCounts) {
    if (!countsByChild[row.child_id]) countsByChild[row.child_id] = {}
    countsByChild[row.child_id][row.status] = parseInt(row.count)
  }

  const annotatedChildren = children.map(child => ({
    ...child,
    assignment_counts: countsByChild[child.id] || {}
  }))

  return { children: annotatedChildren, submittedAssignments, pendingRewards, refundRequests, unassignedAssignments }
}

const getChildDashboard = async (child_id, household_id) => {
  const [{ points_balance }, assignments, rewards, myContributions, myRewards] = await Promise.all([

    knex('users')
      .where({ id: child_id })
      .select('points_balance')
      .first(),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin('chore_schedules', function () {
        this.on('chore_schedules.chore_id', 'chores.id')
            .andOn('chore_schedules.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .select(
        'chore_assignments.id',
        'chore_assignments.status',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points',
        'chores.description',
        'chore_schedules.frequency',
        'chore_schedules.day_of_week',
        'chore_schedules.day_of_month'
      ),

    knex('rewards')
      .leftJoin('reward_contributions', 'rewards.id', 'reward_contributions.reward_id')
      .where({ 'rewards.household_id': household_id })
      .whereIn('rewards.status', ['active', 'funded'])
      .select('rewards.*', knex.raw('COALESCE(SUM(reward_contributions.points), 0) as contributed_total'))
      .groupBy('rewards.id')
      .orderByRaw('(rewards.points_required - COALESCE(SUM(reward_contributions.points), 0)) ASC NULLS LAST'),

    knex('reward_contributions')
      .join('rewards', 'reward_contributions.reward_id', 'rewards.id')
      .where({ 'reward_contributions.child_id': child_id, 'rewards.household_id': household_id })
      .whereIn('rewards.status', ['active', 'funded'])
      .select('reward_contributions.reward_id', 'reward_contributions.points', 'reward_contributions.refund_requested'),

    knex('rewards')
      .where({ household_id, created_by: child_id })
      .whereIn('status', ['active', 'pending'])
      .select('id', 'name', 'description', 'points_required', 'status', 'created_at')
      .orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END")

  ])

  const myContribMap = {}
  for (const c of myContributions) {
    if (!myContribMap[c.reward_id]) myContribMap[c.reward_id] = { points: 0, refund_requested: false }
    myContribMap[c.reward_id].points += c.points
    if (c.refund_requested) myContribMap[c.reward_id].refund_requested = true
  }

  const annotatedRewards = rewards.map(r => ({
    ...r,
    my_contribution: myContribMap[r.id]?.points || 0,
    refund_requested: myContribMap[r.id]?.refund_requested || false,
    remaining: r.points_required - parseInt(r.contributed_total)
  }))

  return {
    points_balance,
    assignments,
    rewards: annotatedRewards,
    myRewards
  }
}


const getChildSummary = async (child_id, household_id) => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 7)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const threeDaysAgo = new Date(startOfToday)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const [missed, today, thisWeek, thisMonth, recentlyCompleted, rewards, myContributions] = await Promise.all([
    // Missed: assigned before today, still in assigned status
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin('chore_schedules', function () {
        this.on('chore_schedules.chore_id', 'chores.id')
            .andOn('chore_schedules.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id, 'chore_assignments.status': 'assigned' })
      .where('chore_assignments.assigned_at', '<', startOfToday)
      .select(
        'chore_assignments.id', 'chore_assignments.status', 'chore_assignments.assigned_at',
        'chores.title as chore_title', 'chores.emoji', 'chores.points', 'chores.description',
        'chore_schedules.frequency', 'chore_schedules.day_of_week', 'chore_schedules.day_of_month'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // Today: daily and one-time (non-recurring) chores assigned today
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin('chore_schedules', function () {
        this.on('chore_schedules.chore_id', 'chores.id')
            .andOn('chore_schedules.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .where('chore_assignments.assigned_at', '>=', startOfToday)
      .where(function () {
        this.whereNull('chore_schedules.frequency')
            .orWhere('chore_schedules.frequency', 'daily')
      })
      .select(
        'chore_assignments.id', 'chore_assignments.status',
        'chores.title as chore_title', 'chores.emoji', 'chores.points',
        'chore_schedules.frequency', 'chore_schedules.day_of_week', 'chore_schedules.day_of_month'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // This week: weekly chores assigned this week (including today)
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin('chore_schedules', function () {
        this.on('chore_schedules.chore_id', 'chores.id')
            .andOn('chore_schedules.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .where('chore_assignments.assigned_at', '>=', startOfWeek)
      .where('chore_schedules.frequency', 'weekly')
      .select(
        'chore_assignments.id', 'chore_assignments.status',
        'chores.title as chore_title', 'chores.emoji', 'chores.points',
        'chore_schedules.frequency', 'chore_schedules.day_of_week', 'chore_schedules.day_of_month'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // This month: monthly chores assigned this month (including today)
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin('chore_schedules', function () {
        this.on('chore_schedules.chore_id', 'chores.id')
            .andOn('chore_schedules.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .where('chore_assignments.assigned_at', '>=', startOfMonth)
      .where('chore_schedules.frequency', 'monthly')
      .select(
        'chore_assignments.id', 'chore_assignments.status',
        'chores.title as chore_title', 'chores.emoji', 'chores.points',
        'chore_schedules.frequency', 'chore_schedules.day_of_week', 'chore_schedules.day_of_month'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // Recently completed: approved in last 3 days
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({ 'chore_assignments.child_id': child_id, 'chore_assignments.status': 'approved' })
      .where('chore_assignments.completed_at', '>=', threeDaysAgo)
      .select(
        'chore_assignments.id', 'chore_assignments.completed_at',
        'chores.title as chore_title', 'chores.emoji', 'chores.points'
      )
      .orderBy('chore_assignments.completed_at', 'desc'),

    // Rewards for closest reward calc
    knex('rewards')
      .leftJoin('reward_contributions', 'rewards.id', 'reward_contributions.reward_id')
      .where({ 'rewards.household_id': household_id, 'rewards.status': 'active' })
      .select('rewards.*', knex.raw('COALESCE(SUM(reward_contributions.points), 0) as contributed_total'))
      .groupBy('rewards.id'),

    // My contributions
    knex('reward_contributions')
      .join('rewards', 'reward_contributions.reward_id', 'rewards.id')
      .where({ 'reward_contributions.child_id': child_id, 'rewards.household_id': household_id, 'rewards.status': 'active' })
      .select('reward_contributions.reward_id', 'reward_contributions.points')
  ])

  // Build contribution map for this child
  const myContribMap = {}
  for (const c of myContributions) {
    if (!myContribMap[c.reward_id]) myContribMap[c.reward_id] = 0
    myContribMap[c.reward_id] += c.points
  }

  // Find closest "my" reward (created by this child) and closest "shared" reward
  let closestMine = null
  let closestMineRatio = -1
  let closestShared = null
  let closestSharedRatio = -1

  for (const r of rewards) {
    const myContrib = myContribMap[r.id] || 0
    if (myContrib === 0) continue
    const remaining = r.points_required - parseInt(r.contributed_total)
    if (remaining <= 0) continue
    const ratio = myContrib / r.points_required
    const entry = {
      id: r.id,
      name: r.name,
      points_required: r.points_required,
      my_contribution: myContrib,
      contributed_total: parseInt(r.contributed_total),
      remaining
    }

    if (r.created_by === child_id) {
      if (ratio > closestMineRatio) { closestMineRatio = ratio; closestMine = entry }
    } else {
      if (ratio > closestSharedRatio) { closestSharedRatio = ratio; closestShared = entry }
    }
  }

  return { missed, today, thisWeek, thisMonth, recentlyCompleted, closestMine, closestShared }
}

module.exports = { getParentDashboard, getChildDashboard, getChildSummary }