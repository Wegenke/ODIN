const authService = require('../services/authService')
const tokenService = require('../services/tokenService')

const getProfiles = async (req,res) => {
  try{
    const profiles = await authService.getProfiles()
    return res.status(200).json(profiles)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
    return res.status(500).json({message:'Server error'})
  }
}

// Session-based login (Thor)
const login = async (req,res) => {
  try{
    const {user_id, pin} = req.body
    const safeUser = await authService.login(user_id, pin)
    req.session.user = safeUser
    return res.status(200).json(safeUser)
  }catch(err){
    if(err.status) return res.status(err.status).json({message:err.message})
    return res.status(500).json({message:'Server error'})
  }
}

// Session-based logout (Thor)
const logout = async (req,res) => {
  req.session.destroy()
  return res.status(200).json({message:'Logged out'})
}

// Session check (Thor)
const getSession = async (req,res) => {
  return req.session.user ? res.status(200).json(req.session.user) : res.status(401).json({message: "Not authenticated"})
}

// JWT-based login (Valkyrie)
const tokenLogin = async (req, res) => {
  try {
    const { user_id, pin } = req.body
    const safeUser = await authService.login(user_id, pin)
    const accessToken = tokenService.generateAccessToken(safeUser)
    const refreshToken = await tokenService.generateRefreshToken(safeUser)
    return res.status(200).json({ accessToken, refreshToken, user: tokenService.buildUserPayload(safeUser) })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

// JWT refresh (Valkyrie)
const tokenRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })
    const tokens = await tokenService.refreshTokens(refreshToken)
    return res.status(200).json(tokens)
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

// JWT revoke / logout (Valkyrie)
const tokenRevoke = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })
    await tokenService.revokeRefreshToken(refreshToken)
    return res.status(200).json({ message: 'Token revoked' })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getProfiles, login, logout, getSession, tokenLogin, tokenRefresh, tokenRevoke }
