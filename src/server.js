require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT

const server = app.listen(PORT, ()=>{
  console.log(`Chore Tracker backend is running on ${PORT}`)
})

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server shut down gracefully')
    process.exit(0)
  })
})