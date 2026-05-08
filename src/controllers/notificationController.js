const notificationService = require('../services/notificationService')

const getOwn = async (req, res) => {
  try {
    const { id } = req.user
    const { unseen } = req.query
    const rows = await notificationService.getOwn(id, { unseen })
    return res.json(rows)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const markAllSeen = async (req, res) => {
  try {
    const { id } = req.user
    const updated = await notificationService.markAllSeen(id)
    return res.json({ updated })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

const markOneSeen = async (req, res) => {
  try {
    const { id: userId } = req.user
    const id = Number(req.params.id)
    const row = await notificationService.markOneSeen(id, userId)
    return res.json(row)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getOwn, markAllSeen, markOneSeen }
