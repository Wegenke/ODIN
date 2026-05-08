const router = require('express').Router()
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const { updateRewardNoteSchema } = require('../validators/rewardNoteSchemas')
const { updateNote, deleteNote } = require('../controllers/rewardNoteController')

router.patch('/:id', auth, roleCheck('parent'), validate(updateRewardNoteSchema), updateNote)
router.delete('/:id', auth, roleCheck('parent'), deleteNote)

module.exports = router
