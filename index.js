const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()

const port = process.env.PORT;
app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
  res.send('Server is running successfully. Welcome to "PH-ASSIGNMENT-09"');
})

app.listen(port, () => {
  console.log(`Server is Running on port ${port}`)
})
