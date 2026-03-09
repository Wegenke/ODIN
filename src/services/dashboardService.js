const knex = require('../db')

const getParentDashboard = async (household_id) => {
  const [children, submittedAssignments, pendingRewards, refundRequests, unassignedAssignments] = await Promise.all([
    knex('users')
      .where({household_id, role:'child'})
      .select('id','name','nick_name','avatar','points_balance'),

    knex('chore_assignments')
      .join('chores','chore_assignments.chore_id','chores.id')
      .join('users','chore_assignments.child_id','users.id')
      .where({
        'chore_assignments.status':'submitted',
        'chores.household_id':household_id
      })
      .select(
        'chore_assignments.id',
        'chore_assignments.submitted_at',
        'chores.title as chore_title',
        'chores.points',
        'users.id as child_id',
        'users.name as child_name',
        'users.avatar as child_avatar'
      ),

    knex('rewards')
      .join('users', 'rewards.created_by', 'users.id')
      .where({
        'rewards.household_id':household_id,
        'rewards.status':'pending'
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
      .orderBy('reward_contributions.created_at', 'asc'),

      knex('chore_assignments')
        .join('chores','chore_assignments.chore_id','chores.id')
        .where({
          'chore_assignments.status':'unassigned',
          'chores.household_id':household_id
        })
        .select(
          'chore_assignments.id',
          'chore_assignments.assigned_at',
          'chores.title as chore_title',
          'chores.points'
        )

  ])

  return { children, submittedAssignments, pendingRewards, refundRequests, unassignedAssignments }
}

const getChildDashboard = async (child_id, household_id) => {
  const [{points_balance}, assignments, rewards, myContributions, myRewards] = await Promise.all([

    knex('users')
      .where({ id: child_id })
      .select('points_balance')
      .first(),

    knex('chore_assignments')
      .join('chores', 'chore_assignments.chore_id', 'chores.id')
      .where({ 'chore_assignments.child_id': child_id })
      .whereIn('chore_assignments.status', ['assigned', 'in_progress', 'paused', 'rejected'])
      .select(
        'chore_assignments.id',
        'chore_assignments.status',
        'chores.title as chore_title',
        'chores.points'
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
      .select('reward_contributions.reward_id', 'reward_contributions.points'),

    knex('rewards')
      .where({ household_id, created_by: child_id })
      .whereIn('status', ['active', 'pending'])
      .select('id', 'name', 'description', 'points_required', 'status', 'created_at')
      .orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END")

  ])

  const myContribMap = {}
  for (const c of myContributions) {
    myContribMap[c.reward_id] = (myContribMap[c.reward_id] || 0) + c.points
  }

  const annotatedRewards = rewards.map(r => ({
    ...r,
    my_contribution: myContribMap[r.id] || 0,
    remaining: r.points_required - parseInt(r.contributed_total)
  }))

  return {
    points_balance,
    assignments,
    rewards: annotatedRewards,
    myRewards
  }
}


module.exports = {getParentDashboard, getChildDashboard}