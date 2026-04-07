const router = require('express').Router()
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const { createAdjustmentSchema } = require('../validators/adjustmentSchemas')
const { createAdjustment, getUnseenAdjustments, markAllSeen } = require('../controllers/adjustmentController')

router.post('/', auth, roleCheck('parent'), validate(createAdjustmentSchema), createAdjustment)
router.get('/unseen', auth, roleCheck('child'), getUnseenAdjustments)
router.patch('/seen', auth, roleCheck('child'), markAllSeen)

module.exports = router
