const knex = require('../db')
const notificationService = require('./notificationService')

const ALLOWED_STATUSES = ['open', 'resolved', 'dismissed']

const createBugReport = async (body, household_id, user_id) => {
  const [report] = await knex('bug_reports')
    .insert({ household_id, user_id, body })
    .returning('*')
  return report
}

const getBugReports = async (household_id, status) => {
  const query = knex('bug_reports')
    .join('users', 'bug_reports.user_id', 'users.id')
    .where('bug_reports.household_id', household_id)
    .select(
      'bug_reports.*',
      'users.name as user_name',
      'users.role as user_role'
    )
    .orderBy('bug_reports.created_at', 'desc')

  if (status) query.where('bug_reports.status', status)

  return query
}

const updateBugReportStatus = async (id, status, household_id) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw Object.assign(new Error('Invalid status'), { status: 400 })
  }
  const report = await knex('bug_reports').where({ id, household_id }).first()
  if (!report) throw Object.assign(new Error('Bug report not found'), { status: 404 })

  const [updated] = await knex('bug_reports')
    .where({ id })
    .update({ status, updated_at: knex.fn.now() })
    .returning('*')

  if (status !== report.status) {
    await notificationService.create({
      household_id,
      user_id: report.user_id,
      type: 'bug_status_changed',
      reference_id: report.id
    })
  }

  return updated
}

module.exports = { createBugReport, getBugReports, updateBugReportStatus }
