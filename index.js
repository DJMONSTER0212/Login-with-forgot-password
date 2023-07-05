const express = require('express')
const app = express()
const port = 8009
const connectDB = require("./db/db")
const userRoutes = require("./routes/userRoutes")
const morgan = require('morgan')
const cors = require("cors");
require('dotenv').config()
const bodyParser = require("body-parser");
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan('tiny'));

connectDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use("/api/user",userRoutes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})