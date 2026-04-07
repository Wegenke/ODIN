const adjustmentService = require('../services/adjustmentService')

const createAdjustment = async (req, res) => {
  try {
    const { household_id, id: parent_id } = req.user
    const adjustment = await adjustmentService.createAdjustment(req.body, household_id, parent_id)
    return res.status(201).json(adjustment)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const getUnseenAdjustments = async (req, res) => {
  try {
    const { id: child_id } = req.user
    const adjustments = await adjustmentService.getUnseenAdjustments(child_id)
    return res.json(adjustments)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const markAllSeen = async (req, res) => {
  try {
    const { id: child_id } = req.user
    await adjustmentService.markAllSeen(child_id)
    return res.json({ message: 'All adjustments marked as seen' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createAdjustment, getUnseenAdjustments, markAllSeen }
