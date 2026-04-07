const knex = require('../db')

const getAssignments = async (household_id) => {
  return await knex('chore_assignments')
    .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
    .leftJoin('users', 'chore_assignments.child_id', 'users.id')
    .where({'chores.household_id':household_id})
    .select(
      'chore_assignments.id',
      'chore_assignments.status',
      'chore_assignments.assigned_at',
      'chore_assignments.submitted_at',
      'chore_assignments.completed_at',
      'chore_assignments.child_id',
      'chores.title as chore_title',
      'chores.points',
      'chores.emoji',
      'users.name as child_name',
      'users.avatar as child_avatar'
    )
    .orderBy('id')
}


const getMyAssignments = async (child_id) => {
  return await knex('chore_assignments')
  .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
  .leftJoin('users', 'chore_assignments.child_id', 'users.id')
  .select(
    'chore_assignments.id',
    'chore_assignments.status',
    'chore_assignments.assigned_at',
    'chore_assignments.submitted_at',
    'chore_assignments.completed_at',
    'chores.title as chore_title',
    'chores.points',
    'users.name as child_name',
    'users.avatar as child_avatar'
  )
  .where('chore_assignments.child_id',child_id)
  .orderBy('id')
}

const getAvailableAssignments = async (household_id) => {
  return await knex('chore_assignments')
    .leftJoin('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({
      'chore_assignments.status':'unassigned',
      'chores.household_id': household_id
    })
    .select(
      'chore_assignments.id',
      'chore_assignments.status',
      'chore_assignments.assigned_at',
      'chores.title as chore_title',
      'chores.emoji',
      'chores.points',
      'chores.description'
    )
    .orderBy('chore_assignments.id')
}

const createAssignment = async (data, household_id) => {
  const chore = await knex('chores').where({id: data.chore_id, household_id}).first()
  if (!chore) throw Object.assign(new Error('Chore not found'), {status: 404})

  if (data.child_id){
    const child = await knex('users')
      .where({id: data.child_id, household_id})
      .first()

    if (!child || child.role !== 'child') throw Object.assign(new Error('User is not a child'), {status: 400})
  }
  const status = data.child_id ? 'assigned' : 'unassigned'
  const [assignment] = await knex('chore_assignments')
    .insert({...data, status})
    .returning('*')
  return assignment
}

const claimAssignment = async (id, child_id) => {
  return await knex.transaction(async trx =>{
    const assignment = await trx('chore_assignments')
      .where({id})
      .forUpdate()
      .first()

    if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
    if(assignment.status !== 'unassigned') throw Object.assign(new Error("Assignment is no longer available"), {status: 400})

    const [claimed_assignment] = await trx('chore_assignments')
      .where({id})
      .update({
        child_id,
        status:'assigned',
        assigned_at:knex.fn.now()
      })
      .returning('*')

    return claimed_assignment
  })
}

const submitAssignment = async (id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .where({id})
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id !== child_id) throw Object.assign(new Error('Not your assignment'), {status: 403})
  if(assignment.status !== 'assigned' && assignment.status !== 'in_progress' && assignment.status !== 'paused') throw Object.assign(new Error('Not in proper status [ASSIGNED,PAUSED,IN PROGRESS]'), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status:'submitted',
      submitted_at:knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: child_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const approveAssignment = async (id, reviewer_id, household_id) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'submitted') throw Object.assign(new Error('Not in SUBMITTED status'), {status: 400})

  const chore = await knex('chores')
    .where({id:assignment.chore_id})
    .first()

  return await knex.transaction(async (trx) => {
    const [updated_assignment] = await trx('chore_assignments')
      .where({id})
      .update({
        status:'approved',
        completed_at: knex.fn.now(),
        reviewed_by: reviewer_id,
        reviewed_at: knex.fn.now()
      })
      .returning('*')

    await trx('users')
      .where({id: assignment.child_id})
      .increment('points_balance', chore.points)

    const [transaction] = await trx('transactions')
      .insert({
        child_id:assignment.child_id,
        amount:chore.points,
        source:'chore_approved',
        reference_id:assignment.id,
        created_at: knex.fn.now()
      })
      .returning('*')

      return {updated_assignment, transaction}
  })
}

const rejectAssignment = async (id, reviewer_id, household_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'submitted') throw Object.assign(new Error('Not in SUBMITTED status'), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status: 'rejected',
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const addComment = async (assignment_id, user_id, comment, household_id) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': assignment_id, 'chores.household_id': household_id})
    .select('chore_assignments.id')
    .first()

  if (!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})

  const [assignment_comment] = await knex('assignment_comments')
  .insert({
    assignment_id,
    user_id,
    comment,
    created_at: knex.fn.now()
  })
  .returning('*')

  return assignment_comment
}

const getComments = async (assignment_id, household_id) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': assignment_id, 'chores.household_id': household_id})
    .select('chore_assignments.id')
    .first()

  if (!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})

  return await knex('assignment_comments')
    .join('users', 'assignment_comments.user_id', 'users.id')
    .where({ assignment_id })
    .select('assignment_comments.*', 'users.name as user_name', 'users.nick_name as user_nick_name')
    .orderBy('assignment_comments.id')

}

const dismissAssignment = async (id, reviewer_id, household_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'assigned' && assignment.status !== 'rejected' && assignment.status !== 'in_progress' && assignment.status !== 'paused') throw Object.assign(new Error('Cannot dismiss from current status [ASSIGNED,REJECTED,PAUSED,IN PROGRESS]'), {status: 400})


  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status: 'dismissed',
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const startAssignment = async (id, child_id) => {
  const assignment = await knex('chore_assignments')
    .where({id})
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id !== child_id) throw Object.assign(new Error('Not your assignment'), {status: 403})
  if(assignment.status !== 'assigned') throw Object.assign(new Error('Assignment status not ASSIGNED'), {status: 400})

  const [started_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status:'in_progress',
      started_at: knex.fn.now()
    })
    .returning('*')

  return started_assignment
}

const pauseAssignment = async (id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .where({id})
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id !== child_id) throw Object.assign(new Error('Not your assignment'), {status: 403})
  if(assignment.status !== 'in_progress') throw Object.assign(new Error('Assignment status not IN PROGRESS'), {status: 400})

  const [paused_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status:'paused',
      paused_at: knex.fn.now(),
      pause_count: assignment.pause_count + 1
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: child_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {paused_assignment, assignment_comment}
}

const resumeAssignment = async (id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .where({id})
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id !== child_id) throw Object.assign(new Error('Not your assignment'), {status: 403})
  if(assignment.status !== 'paused' && assignment.status !== 'parent_paused') throw Object.assign(new Error('Assignment status not PAUSED'), {status: 400})

  const updateData = {
      status:'in_progress',
      paused_at: null
    }

  if(assignment.status === 'paused'){
    updateData.time_paused = assignment.time_paused + Math.floor((Date.now() - new Date(assignment.paused_at).getTime())/1000)
  }

  const [resumed_assignment] = await knex('chore_assignments')
    .where({id})
    .update(updateData)
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: child_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {resumed_assignment, assignment_comment}
}

const resumeRejectedAssignment = async (id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .where({id})
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id !== child_id) throw Object.assign(new Error('Not your assignment'), {status: 403})
  if(assignment.status !== 'rejected') throw Object.assign(new Error('Assignment status not REJECTED'), {status: 400})

  const [resumed_assignment] = await knex('chore_assignments')
    .where({id})
    .update({status:'in_progress'})
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: child_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {resumed_assignment, assignment_comment}
}

const cancelAssignment = async (id, reviewer_id, household_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'assigned' && assignment.status !== 'unassigned' && assignment.status !== 'rejected') throw Object.assign(new Error('Cannot cancel assignments not in UN/ASSIGNED status'), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status: 'canceled',
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const reassignAssignment = async (id, reviewer_id, household_id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()
  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.child_id === child_id) throw Object.assign(new Error('Already assigned to that child'), {status: 400})
  if(assignment.status !== 'assigned' && assignment.status !== 'rejected')throw Object.assign(new Error("Not currently ASSIGNED or REJECTED"), {status: 400})

  const child = await knex('users')
    .where({id: child_id, household_id})
    .first()
  if(!child) throw Object.assign(new Error("No user with that ID"), {status: 404})
  if(child.role === 'parent') throw Object.assign(new Error("Not a child user"), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      child_id: child_id,
      status: 'assigned',
      assigned_at: knex.fn.now(),
      started_at: null,
      paused_at:null,
      time_paused: 0,
      pause_count: 0,
      submitted_at: null,
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const parentStartAssignment = async (id, household_id) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'assigned') throw Object.assign(new Error('Assignment status not ASSIGNED'), {status: 400})

  const [started_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status:'in_progress',
      started_at: knex.fn.now()
    })
    .returning('*')

  return started_assignment
}

const parentPauseAssignment = async (id, reviewer_id, household_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'in_progress') throw Object.assign(new Error('Assignment not IN_PROGRESS'), {status: 400})

  const [paused_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      status:'parent_paused',
      reviewed_by:reviewer_id,
      reviewed_at:knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {paused_assignment, assignment_comment}
}

const pauseAllActive = async (reviewer_id, household_id, comment) => {
  const paused_assignments = await knex('chore_assignments')
    .whereIn('chore_id', knex('chores').where({household_id}).select('id'))
    .where({status: 'in_progress'})
    .update({
      status:'parent_paused',
      reviewed_by:reviewer_id,
      reviewed_at:knex.fn.now()
    })
    .returning('*')

  if(!paused_assignments.length) throw Object.assign(new Error('No active assignments'), {status: 400})

  let assignment_comments = []

  if(comment){
    const rows = paused_assignments.map(row => ({
      assignment_id:row.id,
      user_id:reviewer_id,
      comment,
      created_at:knex.fn.now()
    }))
    assignment_comments = await knex('assignment_comments')
      .insert(rows)
      .returning('*')
  }

  return {paused_assignments, assignment_comments}
}

const assignAssignment = async (id, reviewer_id, household_id, child_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(assignment.status !== 'unassigned') throw Object.assign(new Error('Assignment is not unassigned'), {status: 400})

  const child = await knex('users')
    .where({id: child_id, household_id})
    .first()
  if(!child) throw Object.assign(new Error('No user with that ID'), {status: 404})
  if(child.role === 'parent') throw Object.assign(new Error('Not a child user'), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      child_id,
      status: 'assigned',
      assigned_at: knex.fn.now(),
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

const unassignAssignment = async (id, reviewer_id, household_id, comment) => {
  const assignment = await knex('chore_assignments')
    .join('chores', 'chore_assignments.chore_id', 'chores.id')
    .where({'chore_assignments.id': id, 'chores.household_id': household_id})
    .select('chore_assignments.*')
    .first()

  if(!assignment) throw Object.assign(new Error('Assignment not found'), {status: 404})
  if(!['assigned', 'rejected', 'paused', 'parent_paused'].includes(assignment.status)) throw Object.assign(new Error('Cannot unassign from current status'), {status: 400})

  const [updated_assignment] = await knex('chore_assignments')
    .where({id})
    .update({
      child_id: null,
      status: 'unassigned',
      assigned_at: null,
      started_at: null,
      paused_at: null,
      time_paused: 0,
      pause_count: 0,
      submitted_at: null,
      reviewed_by: reviewer_id,
      reviewed_at: knex.fn.now()
    })
    .returning('*')

  let assignment_comment = null

  if(comment){
    const result = await knex('assignment_comments')
      .insert({
        assignment_id: assignment.id,
        user_id: reviewer_id,
        comment,
        created_at: knex.fn.now()
      })
      .returning('*')

    assignment_comment = result[0]
  }

  return {updated_assignment, assignment_comment}
}

module.exports = {getAssignments, getMyAssignments, createAssignment, submitAssignment, approveAssignment, rejectAssignment, addComment, getComments, dismissAssignment, startAssignment, pauseAssignment, resumeAssignment, resumeRejectedAssignment, cancelAssignment, reassignAssignment, parentStartAssignment, parentPauseAssignment, pauseAllActive, claimAssignment, getAvailableAssignments, assignAssignment, unassignAssignment}