const parentTaskService = require('../services/parentTaskService')

const getTasks = async (req, res) => {
  try {
    const { household_id } = req.user
    const tasks = await parentTaskService.getTasks(household_id)
    return res.json(tasks)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getRecentlyCompleted = async (req, res) => {
  try {
    const { household_id } = req.user
    const tasks = await parentTaskService.getRecentlyCompleted(household_id)
    return res.json(tasks)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const createTask = async (req, res) => {
  try {
    const { household_id, id } = req.user
    const task = await parentTaskService.createTask(req.body, household_id, id)
    return res.status(201).json(task)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateTask = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const task = await parentTaskService.updateTask(id, req.body, household_id)
    return res.json(task)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const startTask = async (req, res) => {
  try {
    const { household_id, id: userId } = req.user
    const id = Number(req.params.id)
    const task = await parentTaskService.startTask(id, household_id, userId)
    return res.json(task)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const pauseTask = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const task = await parentTaskService.pauseTask(id, household_id)
    return res.json(task)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const archiveTask = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const task = await parentTaskService.archiveTask(id, household_id)
    return res.json(task)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const reorderTasks = async (req, res) => {
  try {
    const { household_id } = req.user
    await parentTaskService.reorderTasks(req.body.ids, household_id)
    return res.json({ message: 'Order updated' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getNotes = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const notes = await parentTaskService.getNotes(id, household_id)
    return res.json(notes)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const addNote = async (req, res) => {
  try {
    const { household_id, id: userId } = req.user
    const id = Number(req.params.id)
    const note = await parentTaskService.addNote(id, req.body.content, household_id, userId)
    return res.status(201).json(note)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getTasks, getRecentlyCompleted, createTask, updateTask, startTask, pauseTask, archiveTask, reorderTasks, getNotes, addNote }
