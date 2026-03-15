const router = require('express').Router()
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const { createScheduleSchema, updateScheduleSchema } = require('../validators/scheduleSchemas')
const { createSchedule, getSchedules, getSchedulesByChore, updateSchedule, deleteSchedule } = require('../controllers/scheduleController')

router.post('/', auth, roleCheck('parent'), validate(createScheduleSchema), createSchedule)
router.get('/', auth, roleCheck('parent'), getSchedules)
router.get('/chore/:chore_id', auth, roleCheck('parent'), getSchedulesByChore)
router.patch('/:id', auth, roleCheck('parent'), validate(updateScheduleSchema), updateSchedule)
router.delete('/:id', auth, roleCheck('parent'), deleteSchedule)

module.exports = router
