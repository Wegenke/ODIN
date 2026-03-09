const bcrypt = require('bcrypt')
const setupService = require('../services/setupService')

const saltRounds = 10

async function getSetupStatus(req, res, next) {
  try {
    const status = await setupService.getSetupStatus()
    res.json(status)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error' })

  }
}

async function setup(req, res, next) {
  try {
    const { household, user } = req.body
    const pin_hash = await bcrypt.hash(user.pin, saltRounds)
    const result = await setupService.setup({ household_name: household.name, name: user.name, nick_name: user.nick_name, avatar: user.avatar, pin_hash })
    res.status(201).json(result)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error' })

  }
}

module.exports = { getSetupStatus,  setup }
