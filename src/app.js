const express = require('express')
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet')
const pgSession = require('connect-pg-simple')(session)
const morgan = require('morgan')
const db = require('./db')

const scheduleRouter = require('./routes/schedules')
const parentTaskRouter = require('./routes/parentTasks')
const adjustmentRouter = require('./routes/adjustments')
const { getSetupStatus,  setup } = require('./controllers/setupController')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/users')
const choreRouter = require('./routes/chores')
const assignmentRouter = require('./routes/assignments')
const rewardRouter = require('./routes/rewards')
const transactionRouter = require('./routes/transactions')
const dashboardRouter = require('./routes/dashboards')

const validate = require('./middleware/validate')
const { setupSchema } = require('./validators/setupSchemas')

const app = express()

app.locals.db = db

app.use(helmet({
  // contentSecurityPolicy: false // Change if you see the browser blocking requests with a CSP error.
}))
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(morgan('combined'))
app.use(session({
  store: new pgSession({
    conObject: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, //Set to true for Caddy migration
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30*24*60*60*1000,
  }
}))

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/chores', choreRouter)
app.use('/assignments', assignmentRouter)
app.use('/rewards', rewardRouter)
app.use('/transactions', transactionRouter)
app.use('/dashboard', dashboardRouter)
app.use('/schedules', scheduleRouter)
app.use('/parent-tasks', parentTaskRouter)
app.use('/adjustments', adjustmentRouter)

app.get('/health', async (req, res) => {
  try{
    await req.app.locals.db.raw('SELECT 1')
    res.json({status: 'ok', db: 'ok'})
  }catch{
    res.status(503).json({status: 'error', db: 'error'})
  }
})
app.get('/setup', getSetupStatus)
app.post('/setup', validate(setupSchema), setup)

module.exports = app