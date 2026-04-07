const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const knex = require('../db')

const JWT_SECRET = process.env.JWT_SECRET
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d'

const buildUserPayload = (user) => ({
  id: user.id,
  household_id: user.household_id,
  role: user.role,
  name: user.name,
  nick_name: user.nick_name,
  avatar: user.avatar
})

const generateAccessToken = (user) => {
  return jwt.sign(buildUserPayload(user), JWT_SECRET, { expiresIn: ACCESS_EXPIRY })
}

const generateRefreshToken = async (user) => {
  const token = crypto.randomBytes(64).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  // Parse expiry string to milliseconds
  const match = REFRESH_EXPIRY.match(/^(\d+)([dhms])$/)
  const units = { d: 86400000, h: 3600000, m: 60000, s: 1000 }
  const expiresAt = new Date(Date.now() + parseInt(match[1]) * units[match[2]])

  await knex('refresh_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt
  })

  return token
}

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

const refreshTokens = async (refreshToken) => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

  const stored = await knex('refresh_tokens')
    .where({ token_hash: tokenHash, revoked: false })
    .where('expires_at', '>', new Date())
    .first()

  if (!stored) throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 })

  // Revoke the old refresh token (rotation)
  await knex('refresh_tokens').where({ id: stored.id }).update({ revoked: true })

  // Get fresh user data
  const user = await knex('users').where({ id: stored.user_id }).first()
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 })

  const accessToken = generateAccessToken(user)
  const newRefreshToken = await generateRefreshToken(user)

  return { accessToken, refreshToken: newRefreshToken, user: buildUserPayload(user) }
}

const revokeRefreshToken = async (refreshToken) => {
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
  const result = await knex('refresh_tokens').where({ token_hash: tokenHash }).update({ revoked: true })
  if (result === 0) throw Object.assign(new Error('Token not found'), { status: 404 })
}

const revokeAllUserTokens = async (userId) => {
  await knex('refresh_tokens').where({ user_id: userId, revoked: false }).update({ revoked: true })
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, refreshTokens, revokeRefreshToken, revokeAllUserTokens, buildUserPayload }
