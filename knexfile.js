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

  development: {
    client: 'postgresql',
    connection,
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
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
