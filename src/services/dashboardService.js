const knex = require('../db')

const getParentDashboard = async (household_id) => {
  const [children, submittedAssignments, activeAssignments, pendingRewards, fundedRewardsRaw, refundRequests, unassignedAssignments, assignmentCounts] = await Promise.all([
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

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .join('users', 'chore_assignments.child_id', 'users.id')
      .where({ 'chores.household_id': household_id })
      .whereIn('chore_assignments.status', ['in_progress', 'paused', 'parent_paused'])
      .select(
        'chore_assignments.id',
        'chore_assignments.status',
        'chore_assignments.started_at',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points',
        'users.id as child_id',
        'users.name as child_name',
        'users.avatar as child_avatar'
      )
      .orderBy('chore_assignments.started_at', 'asc'),

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

    knex('rewards')
      .leftJoin('reward_contributions', 'reward_contributions.reward_id', 'rewards.id')
      .leftJoin('users', 'reward_contributions.child_id', 'users.id')
      .where({
        'rewards.household_id': household_id,
        'rewards.status': 'funded'
      })
      .select(
        'rewards.id',
        'rewards.name',
        'rewards.description',
        'rewards.points_required',
        'rewards.created_at',
        'users.id as contributor_id',
        'users.name as contributor_name',
        'users.avatar as contributor_avatar'
      )
      .orderBy([
        { column: 'rewards.created_at', order: 'asc' },
        { column: 'reward_contributions.created_at', order: 'asc' }
      ]),

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

  const fundedRewardsMap = new Map()
  for (const row of fundedRewardsRaw) {
    if (!fundedRewardsMap.has(row.id)) {
      fundedRewardsMap.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        points_required: row.points_required,
        created_at: row.created_at,
        contributors: []
      })
    }
    if (row.contributor_id && !fundedRewardsMap.get(row.id).contributors.some(c => c.id === row.contributor_id)) {
      fundedRewardsMap.get(row.id).contributors.push({
        id: row.contributor_id,
        name: row.contributor_name,
        avatar: row.contributor_avatar
      })
    }
  }
  const fundedRewards = Array.from(fundedRewardsMap.values())

  return { children: annotatedChildren, submittedAssignments, activeAssignments, pendingRewards, fundedRewards, refundRequests, unassignedAssignments }
}

const getChildDashboard = async (child_id, household_id) => {
  const [{ points_balance }, assignments, rewards, myContributions, myRewards] = await Promise.all([

    knex('users')
      .where({ id: child_id })
      .select('points_balance')
      .first(),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin(
        knex('chore_schedules')
          .select('chore_id', 'child_id')
          .min('frequency as frequency')
          .groupBy('chore_id', 'child_id')
          .as('cs'),
        function () {
          this.on('cs.chore_id', 'chores.id')
              .andOn('cs.child_id', 'chore_assignments.child_id')
        }
      )
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .select(
        'chore_assignments.id',
        'chore_assignments.status',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points',
        'chores.description',
        'cs.frequency'
      )
      .orderByRaw(`CASE chore_assignments.status
        WHEN 'in_progress' THEN 0
        WHEN 'paused' THEN 1
        WHEN 'parent_paused' THEN 2
        WHEN 'submitted' THEN 3
        WHEN 'rejected' THEN 4
        WHEN 'assigned' THEN 5
        ELSE 6 END, chore_assignments.assigned_at ASC`),

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
  const dayOfWeekToday = now.getDay()
  const dayOfMonthToday = now.getDate()

  // Helper: deduplicated schedule subquery (one row per chore+child, frequency only)
  const csJoin = () => knex('chore_schedules')
    .select('chore_id', 'child_id')
    .min('frequency as frequency')
    .groupBy('chore_id', 'child_id')
    .as('cs')

  const [missed, today, thisWeek, thisMonth, recentlyCompleted, chorePoolOldest, rewards, myContributions] = await Promise.all([
    // Missed: assigned before today, still in assigned status
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin(csJoin(), function () {
        this.on('cs.chore_id', 'chores.id')
            .andOn('cs.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id, 'chore_assignments.status': 'assigned' })
      .where('chore_assignments.assigned_at', '<', startOfToday)
      .select(
        'chore_assignments.id', 'chore_assignments.status', 'chore_assignments.assigned_at',
        'chores.title as chore_title', 'chores.emoji', 'chores.points', 'chores.description',
        'cs.frequency'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // Today: daily and one-time (non-recurring) chores assigned today
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .leftJoin(csJoin(), function () {
        this.on('cs.chore_id', 'chores.id')
            .andOn('cs.child_id', 'chore_assignments.child_id')
      })
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted', 'rejected'])
      .where('chore_assignments.assigned_at', '>=', startOfToday)
      .where(function () {
        this.whereNull('cs.frequency')
            .orWhere('cs.frequency', 'daily')
      })
      .select(
        'chore_assignments.id', 'chore_assignments.status',
        'chores.title as chore_title', 'chores.emoji', 'chores.points',
        'cs.frequency'
      )
      .orderBy('chore_assignments.assigned_at', 'asc'),

    // This week: weekly schedules whose day hasn't passed AND no assignment yet this week
    knex('chore_schedules')
      .join('chores', 'chore_schedules.chore_id', 'chores.id')
      .where({ 'chore_schedules.child_id': child_id, 'chore_schedules.frequency': 'weekly', 'chore_schedules.active': true })
      .where('chore_schedules.day_of_week', '>=', dayOfWeekToday)
      .whereNotExists(function () {
        this.select('*')
          .from('chore_assignments')
          .whereRaw('chore_assignments.chore_id = chore_schedules.chore_id')
          .whereRaw('chore_assignments.child_id = chore_schedules.child_id')
          .where('chore_assignments.assigned_at', '>=', startOfWeek)
      })
      .select(
        'chore_schedules.id', 'chore_schedules.day_of_week',
        'chores.id as chore_id',
        'chores.title as chore_title', 'chores.emoji', 'chores.points', 'chores.description',
        'chore_schedules.frequency'
      )
      .orderBy('chore_schedules.day_of_week', 'asc'),

    // This month: monthly schedules whose day hasn't passed AND no assignment yet this month
    knex('chore_schedules')
      .join('chores', 'chore_schedules.chore_id', 'chores.id')
      .where({ 'chore_schedules.child_id': child_id, 'chore_schedules.frequency': 'monthly', 'chore_schedules.active': true })
      .where('chore_schedules.day_of_month', '>=', dayOfMonthToday)
      .whereNotExists(function () {
        this.select('*')
          .from('chore_assignments')
          .whereRaw('chore_assignments.chore_id = chore_schedules.chore_id')
          .whereRaw('chore_assignments.child_id = chore_schedules.child_id')
          .where('chore_assignments.assigned_at', '>=', startOfMonth)
      })
      .select(
        'chore_schedules.id', 'chore_schedules.day_of_month',
        'chores.id as chore_id',
        'chores.title as chore_title', 'chores.emoji', 'chores.points', 'chores.description',
        'chore_schedules.frequency'
      )
      .orderBy('chore_schedules.day_of_month', 'asc'),

    // Recently completed: 4 most recent approvals (no date window)
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({ 'chore_assignments.child_id': child_id, 'chore_assignments.status': 'approved' })
      .select(
        'chore_assignments.id', 'chore_assignments.completed_at',
        'chores.title as chore_title', 'chores.emoji', 'chores.points'
      )
      .orderBy('chore_assignments.completed_at', 'desc')
      .limit(4),

    // Chore pool: 3 oldest unassigned chores in the household.
    // Hide team-chore pool entries this child has already actively claimed
    // (mirrors duplicate-guard in claimAssignment + the same filter on
    // /assignments/available).
    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({
        'chore_assignments.status': 'unassigned',
        'chores.household_id': household_id
      })
      .whereNotExists(function () {
        this.select('*')
          .from('chore_assignments as ca2')
          .whereRaw('ca2.chore_id = chore_assignments.chore_id')
          .where('ca2.child_id', child_id)
          .whereIn('ca2.status', ['assigned', 'in_progress', 'paused', 'parent_paused', 'submitted'])
          .whereRaw('ca2.assigned_at >= chore_assignments.assigned_at')
          .where('chores.team_chore', true)
      })
      .select(
        'chore_assignments.id',
        'chore_assignments.assigned_at',
        'chores.title as chore_title',
        'chores.emoji',
        'chores.points',
        'chores.description',
        'chores.team_chore'
      )
      .orderBy('chore_assignments.assigned_at', 'asc')
      .limit(3),

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

  return { missed, today, thisWeek, thisMonth, recentlyCompleted, chorePoolOldest, closestMine, closestShared }
}

const getChildStats = async (child_id, household_id) => {
  const child = await knex('users')
    .where({ id: child_id, household_id, role: 'child' })
    .first()
  if (!child) throw Object.assign(new Error('Child not found'), { status: 404 })

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(startOfToday)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const thirtyDaysAgo = new Date(startOfToday)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const yesterday = new Date(startOfToday)
  yesterday.setDate(yesterday.getDate() - 1)

  const [earnedRows, assignmentRows] = await Promise.all([
    knex('transactions')
      .where('child_id', child_id)
      .where('created_at', '>=', sevenDaysAgo)
      .whereIn('source', ['chore_approved', 'adjustment_reward'])
      .where('amount', '>', 0)
      .select('source', 'amount'),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where('chore_assignments.child_id', child_id)
      .where('chores.household_id', household_id)
      .where('chore_assignments.assigned_at', '>=', thirtyDaysAgo)
      .where('chore_assignments.assigned_at', '<', startOfToday)
      .select(
        'chore_assignments.assigned_at',
        'chore_assignments.status',
        'chore_assignments.started_at',
        'chores.points'
      )
  ])

  const completed = earnedRows.filter(r => r.source === 'chore_approved').length
  const points_earned = earnedRows.reduce((sum, r) => sum + r.amount, 0)

  const missedDays = new Set()
  const allActivityDays = new Set()
  let missed = 0
  let points_missed = 0

  for (const row of assignmentRows) {
    const dayKey = new Date(row.assigned_at)
    dayKey.setHours(0, 0, 0, 0)
    allActivityDays.add(dayKey.getTime())

    const isMissedRow = row.started_at === null && (
      row.status === 'dismissed' ||
      (row.status === 'assigned' && new Date(row.assigned_at) < startOfToday)
    )
    if (isMissedRow) {
      missedDays.add(dayKey.getTime())
      if (new Date(row.assigned_at) >= sevenDaysAgo) {
        missed++
        points_missed += row.points
      }
    }
  }

  let streakDays = 0
  let streakType = 'clean'
  if (allActivityDays.size > 0) {
    streakType = missedDays.has(yesterday.getTime()) ? 'missed' : 'clean'
    const earliestActivity = Math.min(...allActivityDays)
    const daysSinceFirst = Math.floor((yesterday.getTime() - earliestActivity) / 86400000) + 1
    const walkLimit = Math.min(30, daysSinceFirst)

    const cursor = new Date(yesterday)
    for (let i = 0; i < walkLimit; i++) {
      const hasMissed = missedDays.has(cursor.getTime())
      if (streakType === 'clean' && hasMissed) break
      if (streakType === 'missed' && !hasMissed) break
      streakDays++
      cursor.setDate(cursor.getDate() - 1)
    }
  }

  return {
    child_id,
    window_days: 7,
    completed,
    missed,
    points_earned,
    points_missed,
    streak: { days: streakDays, type: streakType }
  }
}

const getLeaderboard = async (household_id) => {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1)

  const [children, transactions] = await Promise.all([
    knex('users')
      .where({ household_id, role: 'child' })
      .where(qb => qb.whereNot({ status: 'inactive' }).orWhereNull('status'))
      .select('id', 'name', 'nick_name', 'avatar')
      .orderBy('id', 'asc'),
    knex('transactions')
      .join('users', 'transactions.child_id', 'users.id')
      .where('users.household_id', household_id)
      .where('users.role', 'child')
      .whereIn('transactions.source', ['chore_approved', 'adjustment_reward'])
      .where('transactions.amount', '>', 0)
      .where('transactions.created_at', '>=', startOfMonth)
      .select('transactions.child_id', 'transactions.amount', 'transactions.created_at')
  ])

  return children.map(child => {
    let today = 0
    let yesterday = 0
    let week = 0
    let month = 0
    for (const t of transactions) {
      if (t.child_id !== child.id) continue
      const ts = new Date(t.created_at)
      if (ts >= startOfMonth) month += t.amount
      if (ts >= startOfWeek) week += t.amount
      if (ts >= startOfYesterday && ts < startOfToday) yesterday += t.amount
      if (ts >= startOfToday) today += t.amount
    }
    return { ...child, today, yesterday, week, month }
  })
}

module.exports = { getParentDashboard, getChildDashboard, getChildSummary, getChildStats, getLeaderboard }