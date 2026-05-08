const router = require('express').Router()
const auth = require('../middleware/auth')
const { getOwn, markAllSeen, markOneSeen } = require('../controllers/notificationController')

router.get('/', auth, getOwn)
router.patch('/seen', auth, markAllSeen)
router.patch('/:id/seen', auth, markOneSeen)

module.exports = router
