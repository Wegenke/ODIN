const express = require('express')
const {getMyTransactions, getTransactionsByChild, getHouseholdTransactions} = require('../controllers/transactionController')
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validateQuery = require('../middleware/validateQuery')
const  {transactionSchema} = require('../validators/transactionSchemas')

const router = express.Router()
router.get('/', auth, roleCheck('parent'), validateQuery(transactionSchema), getHouseholdTransactions)
router.get('/mine', auth, roleCheck('child'), validateQuery(transactionSchema), getMyTransactions)
router.get('/:id', auth, roleCheck('parent'), validateQuery(transactionSchema), getTransactionsByChild)

module.exports = router