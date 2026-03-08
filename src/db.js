const env = process.env.NODE_ENV || 'development'
require('dotenv').config({ path: env === 'test' ? '.env.test' : '.env' })
const knex = require('knex')(require('../knexfile')[env])

module.exports = knex