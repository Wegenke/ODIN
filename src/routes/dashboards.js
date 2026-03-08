const express = require('express')
const {getParentDashboard, getChildDashboard} = require('../controllers/dashboardController')
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')

const router = express.Router()
router.get('/parent', auth, roleCheck('parent'), getParentDashboard)
router.get('/child', auth, roleCheck('child'), getChildDashboard)

module.exports = router
