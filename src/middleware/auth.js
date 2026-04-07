const { verifyAccessToken } = require('../services/tokenService')

const auth = (req, res, next) => {
  // Try JWT Bearer token first
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      req.user = verifyAccessToken(token)
      return next()
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }

  // Fall back to session
  if (req.session?.user) {
    req.user = req.session.user
    return next()
  }

  return res.status(401).json({ message: 'Not authenticated' })
}

module.exports = auth
