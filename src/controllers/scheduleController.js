const scheduleService = require('../services/scheduleService')

const createSchedule = async (req, res) => {
  try {
    const { household_id } = req.user
    const result = await scheduleService.createSchedule(req.body, household_id)
    return res.status(201).json(result)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getSchedules = async (req, res) => {
  try {
    const { household_id } = req.user
    const schedules = await scheduleService.getSchedulesByHousehold(household_id)
    return res.json(schedules)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getSchedulesByChore = async (req, res) => {
  try {
    const { household_id } = req.user
    const chore_id = Number(req.params.chore_id)
    const schedules = await scheduleService.getSchedulesByChore(chore_id, household_id)
    return res.json(schedules)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateSchedule = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const schedule = await scheduleService.updateSchedule(id, req.body, household_id)
    return res.json(schedule)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteSchedule = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    await scheduleService.deleteSchedule(id, household_id)
    return res.json({ message: 'Schedule deleted' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createSchedule, getSchedules, getSchedulesByChore, updateSchedule, deleteSchedule }
