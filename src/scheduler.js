const cron = require('node-cron')
const knex = require('./db')
const { TERMINAL_STATES } = require('./services/scheduleService')

const runScheduler = async () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const dayOfMonth = now.getDate()

  const schedules = await knex('chore_schedules').where({ active: true })

  for (const schedule of schedules) {
    if (schedule.frequency === 'weekly' && schedule.day_of_week !== dayOfWeek) continue
    if (schedule.frequency === 'monthly' && schedule.day_of_month !== dayOfMonth) continue

    const latest = await knex('chore_assignments')
      .where({ chore_id: schedule.chore_id, child_id: schedule.child_id })
      .orderBy('assigned_at', 'desc')
      .first()

    if (latest && !TERMINAL_STATES.includes(latest.status)) continue

    await knex('chore_assignments')
      .insert({ chore_id: schedule.chore_id, child_id: schedule.child_id, status: 'assigned' })

    await knex('chore_schedules')
      .where({ id: schedule.id })
      .update({ last_generated_at: knex.fn.now() })

    console.log(`[scheduler] Created assignment: chore ${schedule.chore_id} → child ${schedule.child_id}`)
  }
}

cron.schedule('0 3 * * *', async () => {
  console.log('[scheduler] Running daily chore schedule check...')
  try {
    await runScheduler()
    console.log('[scheduler] Complete.')
  } catch (err) {
    console.error('[scheduler] Error:', err.message)
  }
})

console.log('[scheduler] Initialized — runs daily at 3:00am')

module.exports = { runScheduler }
