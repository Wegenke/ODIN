const express = require('express')
const { getProfiles, login, logout, getSession, tokenLogin, tokenRefresh, tokenRevoke } = require('../controllers/authController')
const validate = require('../middleware/validate')
const loginRateLimiter = require('../middleware/loginRateLimiter')
const { loginSchema } = require('../validators/authSchemas')

const router = express.Router()

// Session-based (Thor)
router.get('/profiles', getProfiles)
router.post('/login', validate(loginSchema), loginRateLimiter, login)
router.post('/logout', logout)
router.get('/session', getSession)

// JWT-based (Valkyrie)
router.post('/token', validate(loginSchema), loginRateLimiter, tokenLogin)
router.post('/token/refresh', tokenRefresh)
router.post('/token/revoke', tokenRevoke)

module.exports = router
