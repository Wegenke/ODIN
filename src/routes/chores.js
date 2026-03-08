const express = require('express')
const {getChores, createChore, updateChore} = require('../controllers/choreController')
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const {choreSchema,updateChoreSchema} = require('../validators/choreSchemas')

const router = express.Router()
router.get('/', auth, getChores)
router.post('/', auth, roleCheck('parent'), validate(choreSchema), createChore)
router.patch('/:id', auth, roleCheck('parent'), validate(updateChoreSchema), updateChore)

module.exports = router
