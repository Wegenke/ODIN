const express = require('express')
const {getUsers, getUserById, getUserTransactions, createUser,getRecentPinChanges, updateUser, updateMe} = require('../controllers/userController')
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const {userSchema,updateUserSchema,updateMeSchema} = require('../validators/userSchemas')

const router = express.Router()
router.get('/', auth, roleCheck('parent'), getUsers)
router.post('/', auth, roleCheck('parent'), validate(userSchema), createUser)
router.get('/pin_changes', auth, roleCheck('parent'), getRecentPinChanges)
router.patch('/me', auth, validate(updateMeSchema), updateMe)
router.get('/:id', auth, getUserById)
router.patch('/:id', auth, roleCheck('parent'), validate(updateUserSchema), updateUser)
router.get('/:id/transactions', auth, roleCheck('parent'),getUserTransactions)



module.exports = router