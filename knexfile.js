const env = process.env.NODE_ENV || 'development'
require('dotenv').config({ path: env === 'test' ? '.env.test' : '.env' })

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

const connection = {
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
}

module.exports = {

  production: {
    client: 'postgresql',
    connection,
    migrations: {
      directory: './db/migrations',
    }
  },

  test: {
    client: 'postgresql',
    connection,
    migrations: {
      directory: './db/migrations',
    }
  }

};
