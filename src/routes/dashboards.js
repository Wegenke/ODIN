const express = require('express')
const {getParentDashboard, getChildDashboard, viewChildDashboard} = require('../controllers/dashboardController')
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')

const router = express.Router()
router.get('/parent', auth, roleCheck('parent'), getParentDashboard)
router.get('/child', auth, roleCheck('child'), getChildDashboard)
router.get('/child/:child_id', auth, roleCheck('parent'), viewChildDashboard)

module.exports = router
