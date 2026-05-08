const router = require('express').Router()
const auth = require('../middleware/auth')
const roleCheck = require('../middleware/roleCheck')
const validate = require('../middleware/validate')
const { createBugReportSchema, updateBugReportSchema } = require('../validators/bugReportSchemas')
const { createBugReport, getBugReports, updateBugReportStatus } = require('../controllers/bugReportController')

router.post('/', auth, validate(createBugReportSchema), createBugReport)
router.get('/', auth, roleCheck('parent'), getBugReports)
router.patch('/:id', auth, roleCheck('parent'), validate(updateBugReportSchema), updateBugReportStatus)

module.exports = router
