const mongoose = require('mongoose');

const dbURL = process.env.DB_URL;

const connectDB = async()=>{
    try{
        await mongoose.connect(dbURL)
        console.log("Connected to DB")
    }
    catch(err){
        console.log(err, "Unable to connect");
        process.exit(1);
    }
};
module.exports = connectDB;