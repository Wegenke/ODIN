require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT

app.listen(PORT, ()=>{
  console.log(`Chore Tracker backend is running on ${PORT}`)
})

