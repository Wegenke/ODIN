const rewardNoteService = require('../services/rewardNoteService')

const getNotes = async (req, res) => {
  try {
    const { household_id } = req.user
    const reward_id = Number(req.params.id)
    const notes = await rewardNoteService.getNotes(reward_id, household_id)
    return res.json(notes)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const addNote = async (req, res) => {
  try {
    const { household_id, id: userId } = req.user
    const reward_id = Number(req.params.id)
    const note = await rewardNoteService.addNote(reward_id, req.body.body, household_id, userId)
    return res.status(201).json(note)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateNote = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    const note = await rewardNoteService.updateNote(id, req.body.body, household_id)
    return res.json(note)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteNote = async (req, res) => {
  try {
    const { household_id } = req.user
    const id = Number(req.params.id)
    await rewardNoteService.deleteNote(id, household_id)
    return res.status(204).send()
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getNotes, addNote, updateNote, deleteNote }
