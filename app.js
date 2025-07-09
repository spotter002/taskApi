const express = require('express')
const mongoose = require('mongoose')
const app = express()
require('dotenv').config()

// middleware
app.use(express.json())

app.use('uploads', express.static('uploads'))

//routes
const auth= require('./routes/auth')
app.use('/api/auth', auth)  
const user= require('./routes/user')
app.use('/api/user', user)
const task = require('./routes/task')
app.use('/api/task', task)
const employee = require('./routes/employees')
app.use('/api/employee', employee)

//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err)
})

//listener to the server
app.listen(3001,()=>{
    console.log("Server is running on port 3000")
})