const express = require('express')
const cors = require('cors')
const session = require('express-session')
const helmet = require('helmet')

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

app.use(helmet({
  // contentSecurityPolicy: false // Change if you see the browser blocking requests with a CSP error.
}))
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, //Set to true for Caddy migration
    httpOnly: true,
    sameSite: 'lax',
  }
}))

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/chores', choreRouter)
app.use('/assignments', assignmentRouter)
app.use('/rewards', rewardRouter)
app.use('/transactions', transactionRouter)
app.use('/dashboard', dashboardRouter)

app.get('/health', (request, response) => {response.json({status:'ok'})})
app.get('/setup', getSetupStatus)
app.post('/setup', validate(setupSchema), setup)

module.exports = app