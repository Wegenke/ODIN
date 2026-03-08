const express = require('express')
const {getProfiles, login, logout, getSession} = require('../controllers/authController')
const validate = require('../middleware/validate')
const loginRateLimiter = require('../middleware/loginRateLimiter')
const {loginSchema} = require('../validators/authSchemas')

const router = express.Router()

router.get('/profiles', getProfiles)
router.post('/login', validate(loginSchema), loginRateLimiter, login)
router.post('/logout', logout)
router.get('/session', getSession)

module.exports = router