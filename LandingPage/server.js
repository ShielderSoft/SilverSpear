const express = require("express")
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const userRouter = require("./routes/userRoute");

const app = express();

connectDB();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
  });
app.use(cors({
    origin: '*'
  }));
app.use(express.json());
app.use("/api/users", userRouter);

app.listen(8082, ()=>{
    console.log("Server is up and running on 8082")
})